/* eslint-disable no-console */
// @ts-check
import {createReadStream} from 'fs';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import * as rl from 'readline';
import * as path from 'path';
import * as dotenv from 'dotenv';
import {MeiliSearch} from 'meilisearch';
import {ignoreENOENT} from '@gjbkz/gojabako.zone-node-util';
import {createSerializeMarkdownContext} from '@gjbkz/gojabako.zone-markdown-parser';
import {getTextContent} from '@gjbkz/gojabako.zone-markdown-util';
import {ensure, isString} from '@nlib/typing';
import {pagesDirectory, rootDirectory} from '../config.paths.mjs';
import {pageListByUpdatedAt} from '../generated.pageList.mjs';

/** @typedef {{id: string, pathname: string, title: string, body: string, publishedAt: string, updatedAt: string}} Page */
/** @typedef {{id: string, date: string, userId: string, body: string}} LogItem */

const env = ensure(
    dotenv.parse(await fs.readFile(path.join(rootDirectory, '.env.development.local'))),
    {
        NEXT_PUBLIC_MEILISEARCH_HOST: isString,
        MEILISEARCH_ADMIN_API_KEY: isString,
    },
);
const pageExtensions = new Set(['.tsx', '.md']);
/** @param {string} name */
const hasPageExtension = (name) => pageExtensions.has(path.extname(name));

/** @param {string} pagePath */
const findPageFile = async (pagePath) => {
    let directory = path.join(pagesDirectory, pagePath);
    let stats = await fs.stat(directory).catch(ignoreENOENT);
    if (stats && stats.isDirectory()) {
        for (const name of await fs.readdir(directory)) {
            if (name.startsWith('index') && hasPageExtension(name)) {
                return path.join(directory, name);
            }
        }
    } else {
        directory = path.dirname(pagesDirectory);
        stats = await fs.stat(directory).catch(ignoreENOENT);
        const basename = path.basename(pagePath);
        for (const name of await fs.readdir(directory)) {
            if (name.startsWith(basename) && hasPageExtension(name)) {
                return path.join(directory, name);
            }
        }
    }
    return null;
};

const listPages = async function* () {
    for (const page of pageListByUpdatedAt) {
        const pageFile = await findPageFile(page.pathname);
        if (pageFile) {
            yield {...page, pageFile};
        }
    }
};
const mdContext = createSerializeMarkdownContext({
    transformLink: (href) => href,
});
/** @param {string} file */
const getBodyFromMarkdown = async (file) => {
    const content = await fs.readFile(file, 'utf8');
    return getTextContent(mdContext.parseMarkdown(content));
};
/** @param {string} file */
const getBodyFromTsx = async (file) => {
    const content = await fs.readFile(file, 'utf8');
    const regexp = />(.*?)</g;
    let matched = regexp.exec(content);
    /** @type {Array<string>} */
    const fragments = [];
    while (matched) {
        const fragment = matched[1].trim();
        if (fragment) {
            fragments.push(fragment);
        }
        matched = regexp.exec(content);
    }
    return fragments.join(' ');
};
/** @param {string} pagePath */
const getId = (pagePath) => {
    const hash = crypto.createHash('sha256');
    hash.update(pagePath);
    return hash.digest('base64url');
};
const client = new MeiliSearch({
    host: env.NEXT_PUBLIC_MEILISEARCH_HOST,
    apiKey: env.MEILISEARCH_ADMIN_API_KEY,
});
const indexNames = {
    page: 'page',
    lifelog: 'lifelog',
};
if (process.argv.includes('put-pages')) {
    const index = client.index(indexNames.page);
    /** @type {Array<Page>} */
    const documents = [];
    for await (const page of listPages()) {
        switch (path.extname(page.pageFile)) {
        case '.md': {
            documents.push({
                id: getId(page.pathname),
                pathname: page.pathname,
                title: page.title,
                body: await getBodyFromMarkdown(page.pageFile),
                publishedAt: page.publishedAt,
                updatedAt: page.updatedAt,
            });
            break;
        }
        case '.tsx': {
            documents.push({
                id: getId(page.pathname),
                pathname: page.pathname,
                title: page.title,
                body: await getBodyFromTsx(page.pageFile),
                publishedAt: page.publishedAt,
                updatedAt: page.updatedAt,
            });
            break;
        }
        default:
        }
    }
    const response = await index.addDocuments(documents);
    console.info(response);
    await index.updateTypoTolerance({enabled: false});
}

const listLifeLogItems = async function* () {
    const tsvPath = path.join(rootDirectory, 'crowd_liflog_10000.tsv');
    const lines = rl.createInterface({
        input: createReadStream(tsvPath),
        crlfDelay: Infinity,
    });
    for await (const line of lines) {
        const [id, date, userId, rawBody] = line.trim().split(/\t/);
        const body = rawBody.split('##').join('\n');
        yield {id, date, userId, body};
    }
};

if (process.argv.includes('put-lifelog')) {
    /** @type {Array<LogItem>} */
    let documents = [];
    const index = client.index(indexNames.lifelog);
    const put = async (waitMs = 5000) => {
        if (0 < documents.length) {
            const response = await index.addDocuments(documents);
            // eslint-disable-next-line require-atomic-updates
            documents = [];
            console.info(response);
            await new Promise((resolve) => {
                setTimeout(resolve, waitMs);
            });
        }
    };
    for await (const item of listLifeLogItems()) {
        documents.push(item);
        if (100 < documents.length) {
            await put();
        }
    }
    await put(0);
}

if (process.argv.includes('check-status')) {
    for (const indexName of Object.values(indexNames)) {
        const index = client.index(indexName);
        const {results} = await index.getTasks();
        console.info(`## ${indexName}`);
        for (const task of results) {
            console.info(task);
        }
    }
}
