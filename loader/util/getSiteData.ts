import * as fs from 'fs';

interface SiteData {
    baseUrl: URL,
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
    const filePath = new URL('../../package.json', import.meta.url);
    const json = fs.readFileSync(filePath, 'utf-8');
    const parsed: unknown = JSON.parse(json);
    if (!isRecordLike(parsed)) {
        throw new Error(`Invalid package.json: ${json}`);
    }
    const {name: domainName, siteName} = parsed;
    const baseUrl = new URL(`https://${domainName}`);
    if (typeof siteName === 'string') {
        cached = {baseUrl, siteName};
        return cached;
    }
    throw new Error(`Invalid siteName: ${siteName}`);
};
