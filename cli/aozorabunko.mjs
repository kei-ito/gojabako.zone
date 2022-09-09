/* eslint-disable new-cap, no-console */
// @ts-check
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as stream from 'stream';
import * as rl from 'readline';
import * as unzipper from 'unzipper';
import {isObject} from '@nlib/typing';
import {rootDirectory} from '../config.paths.mjs';

/** @param {number} durationMs */
const wait = async (durationMs) => await new Promise((resolve) => {
    setTimeout(resolve, durationMs);
});
const timeoutError = new Error('Timeout');
/**
 * @param {string | URL} url
 * @param {https.RequestOptions} options
 * @param {number} timeoutMs
 * @returns {Promise<http.IncomingMessage>}
 */
const get = (url, options = {}, timeoutMs = 0) => new Promise((resolve, reject) => {
    console.info(`GET ${url}`);
    const req = (`${url}`.startsWith('https:') ? https : http).request(url, options);
    req.once('error', reject);
    const timerId = setTimeout(() => {
        if (0 < timeoutMs) {
            reject(timeoutError);
        }
    }, timeoutMs);
    req.once('response', (res) => {
        clearTimeout(timerId);
        console.info(`${res.statusCode} ${res.statusMessage} ${JSON.stringify(res.headers, null, 2)}`);
        resolve(res);
    });
    req.end();
});
/**
 * @param {stream.Readable} readable
 * @returns {Promise<Buffer>}
 */
const readStream = async (readable) => await new Promise((resolve, reject) => {
    /** @type {Array<Buffer>} */
    const chunks = [];
    let totalLength = 0;
    readable.pipe(new stream.Writable({
        /**
         * @param {Buffer} chunk
         * @param {string} _encoding
         * @param {() => void} callback
         */
        write: (chunk, _encoding, callback) => {
            chunks.push(chunk);
            totalLength += chunk.byteLength;
            callback();
        },
        final: (callback) => {
            callback();
            resolve(Buffer.concat(chunks, totalLength));
        },
    }))
    .once('error', reject);
});
const zipDirectory = path.join(rootDirectory, 'cli', 'aozorabunko');
await fs.promises.mkdir(zipDirectory, {recursive: true});
const defaultHeaders = {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
    'origin': 'https://www.aozora.gr.jp/',
    'referer': 'https://www.aozora.gr.jp/',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
};
/**
 * @param {URL} url
 * @param {string} name
 * @param {Record<string, string>} headers
 * @param {number} timeoutMs
 */
const getOrDownloadZip = async (url, name, headers = defaultHeaders, timeoutMs = 0) => {
    const zipPath = path.join(zipDirectory, name);
    const zipStats = await fs.promises.stat(zipPath).catch(() => null);
    if (!zipStats || !zipStats.isFile()) {

        const response = await get(url, {headers}, timeoutMs);
        await new Promise((resolve, reject) => {
            response.pipe(fs.createWriteStream(zipPath))
            .once('error', reject)
            .once('finish', resolve);
        });
        await wait(50);
    }
    console.info(`zipPath: ${zipPath}`);
    return zipPath;
};
/** @param {string} zipPath */
const parseZip = async function* (zipPath) {
    console.info(`unzip ${zipPath}`);
    const zipStream = fs.createReadStream(zipPath).pipe(unzipper.Parse({forceStream: true}));
    try {
        for await (const entry of zipStream) {
            console.info(`unzip entry ${entry.path}`);
            yield entry;
        }
    } catch (error) {
        if (!isObject(error) || error.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
            throw error;
        }
    } finally {
        console.info(`unzip ${zipPath} done`);
    }
};
const listItems = async function* () {
    const listZipPath = await getOrDownloadZip(
        new URL('https://www.aozora.gr.jp/index_pages/list_person_all_utf8.zip'),
        'all.zip',
    );
    for await (const input of parseZip(listZipPath)) {
        if (`${input.path}`.endsWith('.csv')) {
            for await (const line of rl.createInterface({input, crlfDelay: Infinity})) {
                const row = line.split(',', 4);
                const authorId = row[0];
                const authorName = row[1].slice(1, -1);
                const bookId = row[2];
                const title = row[3].slice(1, -1);
                if ((/^\d+$/).test(authorId) && (/^\d+$/).test(bookId)) {
                    yield {authorId, authorName, bookId, title};
                }
            }
        }
    }
};
/** @type {Array<Promise<unknown>>} */
const tasks = [];
for await (const {authorId, authorName, bookId, title} of listItems()) {
    console.info(`${bookId} ${authorName} ${title}`);
    const pageUrl = `https://www.aozora.gr.jp/cards/${authorId}/card${bookId.replace(/^0+/, '')}.html`;
    const htmlPath = path.join(zipDirectory, `${authorId}-${bookId}.html`);
    let html = await fs.promises.readFile(htmlPath, 'utf8').catch(() => null);
    if (!html) {
        const response = await get(pageUrl, {headers: {referer: pageUrl}});
        html = `${await readStream(response)}`;
        await fs.promises.writeFile(htmlPath, html);
    }
    const matched = (/<td><a[^>]*?href="(.*?.zip)"[^>]*?>/).exec(html);
    if (matched) {
        tasks.push(
            getOrDownloadZip(
                new URL(matched[1], pageUrl),
                `${authorId}-${bookId}.zip`,
                defaultHeaders,
                6000,
            )
            .catch((error) => {
                console.error(error);
            }),
        );
        if (6 < tasks.length) {
            await Promise.all(tasks);
        }
    }
}
