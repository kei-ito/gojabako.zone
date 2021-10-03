import * as path from 'path';
import * as fs from 'fs';

interface SiteData {
    rootPath: string,
    baseUrl: string,
    siteName: string,
}

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
    const {name: domainName, siteName} = parsed;
    const baseUrl = new URL(`https://${domainName}`).href;
    if (typeof siteName === 'string') {
        cached = {rootPath, baseUrl, siteName};
        return cached;
    }
    throw new Error(`Invalid siteName: ${siteName}`);
};
