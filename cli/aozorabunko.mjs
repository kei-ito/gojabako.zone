/* eslint-disable new-cap, no-console */
// @ts-check
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as stream from 'stream';
import * as rl from 'readline';
import * as unzipper from 'unzipper';
import archiver from 'archiver';
import {createTypeChecker, isObject, isString} from '@nlib/typing';
import {rootDirectory} from '../config.paths.mjs';

/** @param {number} durationMs */
const wait = async (durationMs) => await new Promise((resolve) => {
    setTimeout(resolve, durationMs);
});
/** @param {stream.Readable} readable */
const listLines = async function* (readable) {
    yield* rl.createInterface({input: readable, crlfDelay: Infinity});
};
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
        await wait(0);
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
    for await (const entry of parseZip(listZipPath)) {
        if (`${entry.path}`.endsWith('.csv')) {
            for await (const line of listLines(entry)) {
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
/**
 * @param {string} authorId
 * @param {string} bookId
 */
const getAozoraBunkoPageUrl = (authorId, bookId) => {
    return `https://www.aozora.gr.jp/cards/${authorId}/card${bookId.replace(/^0+/, '')}.html`;
};
const listBookZipFiles = async function* () {
    for await (const item of listItems()) {
        const {authorId, authorName, bookId, title} = item;
        console.info(`${bookId} ${authorName} ${title}`);
        const pageUrl = getAozoraBunkoPageUrl(authorId, bookId);
        const htmlPath = path.join(zipDirectory, `${authorId}-${bookId}.html`);
        let html = await fs.promises.readFile(htmlPath, 'utf8').catch(() => null);
        if (!html) {
            const response = await get(pageUrl, {headers: {referer: pageUrl}});
            html = `${await readStream(response)}`;
            await fs.promises.writeFile(htmlPath, html);
        }
        const matched = (/<td><a[^>]*?href="(.*?.zip)"[^>]*?>/).exec(html);
        if (matched) {
            const zipPath = await getOrDownloadZip(
                new URL(matched[1], pageUrl),
                `${authorId}-${bookId}.zip`,
                defaultHeaders,
                6000,
            ).catch((error) => {
                console.error(error);
                return null;
            });
            if (zipPath) {
                yield {...item, zipPath};
            }
        }
    }
};
/**
 * @param {string} input
 * @param {boolean} debug
 */
const removeAozoraBunkoMarkups = (input, debug = false) => input
.replace(/(?:｜(.*?))?《[^》]+》/g, (matched, result = '') => {
    if (debug) {
        console.info(`ruby: ${matched} → "${result}"`);
    }
    return result;
})
.replace(/※?［＃[^］]+］/g, (matched) => {
    if (debug) {
        console.info(`note: ${matched}`);
    }
    return '';
});
/** https://www.aozora.gr.jp/KOSAKU/MANUAL_2.html#ruby */
console.info(removeAozoraBunkoMarkups(
    [
        '武州｜青梅《おうめ》の宿',
        '確実さで、益※［＃二の字点、面区点番号1-2-22］《ますます》はっきりと',
        '兄きのような Fanatiker《ファナチイケル》 とは',
        'Kosinski《コジンスキイ》 soll《ゾル》 leben《レエベン》 !',
        'そんな｜お伽話《フェヤリー・ストーリース》は、',
        'いいか｜釜右ヱ門《かまえもん》。',
        '彼は ｜Au revoir《さらば》 と、',
    ].join('\n'),
    true,
));
/** @param {stream.Readable} readable */
const extractBodyFromAozoraSourceText = async (readable) => {
    const sjisDecoder = new TextDecoder('shift_jis');
    const decoded = readable.pipe(new stream.Transform({
        transform(chunk, _encoding, callback) {
            this.push(sjisDecoder.decode(chunk));
            callback();
        },
    }));
    let part = 0;
    let body = '';
    let emptyCount = 0;
    for await (let line of listLines(decoded)) {
        line = line.trim();
        const isDelimiter = (/^----------*$/).test(line);
        const isFootNoteStart = 2 <= emptyCount && line.startsWith('底本');
        if (isDelimiter || isFootNoteStart) {
            part += 1;
        }
        if (!isDelimiter && part === 2) {
            const normalized = removeAozoraBunkoMarkups(line).normalize('NFKC').trim();
            if (0 < normalized.length) {
                body += `${normalized}\n`;
            }
        }
        emptyCount = line.length === 0 ? emptyCount + 1 : 0;
    }
    return body.trimEnd();
};
const isBookInfo = createTypeChecker('BookInfo', {
    authorId: isString,
    authorName: isString,
    bookId: isString,
    title: isString,
    zipPath: isString,
});
if (process.argv.includes('download')) {
    for await (const book of listBookZipFiles()) {
        console.info(`${book.authorId}-${book.bookId} ${book.authorName} ${book.title}`);
        const jsonDest = path.join(zipDirectory, `${book.authorId}-${book.bookId}.json`);
        await fs.promises.writeFile(jsonDest, JSON.stringify(book, null, 2));
    }
} else if (process.argv.includes('zip')) {
    const archive = archiver('zip', {zlib: {level: 9}});
    const writePromise = new Promise((resolve, reject) => {
        const dest = path.join(zipDirectory, '_aozorabunko.zip');
        archive.pipe(fs.createWriteStream(dest))
        .once('error', reject)
        .once('finish', resolve);
    });
    for (const name of await fs.promises.readdir(zipDirectory)) {
        if ((/^\d+-\d+\.json$/).test(name)) {
            const json = await fs.promises.readFile(path.join(zipDirectory, name), 'utf8');
            const book = JSON.parse(json);
            if (isBookInfo(book)) {
                for await (const entry of parseZip(book.zipPath)) {
                    if (`${entry.path}`.endsWith('.txt')) {
                        const buffer = Buffer.from([
                            `${JSON.stringify({
                                url: getAozoraBunkoPageUrl(book.authorId, book.bookId),
                                authorId: book.authorId,
                                authorName: book.authorName,
                                bookId: book.bookId,
                                title: book.title,
                            }, null, 2)}`,
                            await extractBodyFromAozoraSourceText(entry),
                        ].join('\n'));
                        archive.append(buffer, {name: `${book.authorId}-${book.authorName}.txt`});
                    }
                }
            }
        }
    }
    archive.finalize();
    await writePromise;
}
