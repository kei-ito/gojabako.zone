import * as path from 'path';
import * as fs from 'fs';

interface Author {
    name: string,
    email: string,
}
interface SiteData {
    rootPath: string,
    baseUrl: string,
    siteName: string,
    author: Author,
}

const isString = (input: unknown): input is string => typeof input === 'string';
const isRecordLike = (input: unknown): input is Record<string, unknown> => {
    if (input) {
        switch (typeof input) {
        case 'object':
        case 'function':
            return true;
        default:
        }
    }
    return false;
};
const isAuthor = (input: unknown): input is Author => {
    if (isRecordLike(input)) {
        const {name, email} = input;
        return isString(name) && isString(email);
    }
    return false;
};

let cached: SiteData | null = null;

export const getSiteData = (): SiteData => {
    if (cached) {
        return cached;
    }
    const rootPath = new URL('../..', import.meta.url).pathname;
    const json = fs.readFileSync(path.join(rootPath, 'package.json'), 'utf-8');
    const parsed: unknown = JSON.parse(json);
    if (!isRecordLike(parsed)) {
        throw new Error(`Invalid package.json: ${json}`);
    }
    const {name: domainName, siteName, author} = parsed;
    const baseUrl = new URL(`https://${domainName}`).href;
    if (!isString(siteName)) {
        throw new Error(`Invalid siteName: ${siteName}`);
    }
    if (!isAuthor(author)) {
        throw new Error(`Invalid author: ${JSON.stringify(author, null, 4)}`);
    }
    cached = {rootPath, baseUrl, siteName, author};
    return cached;
};
