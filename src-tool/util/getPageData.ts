import * as fs from 'fs';
import type {FileData} from './getFileData';
import {getExtension} from './getExtension';
import {getFileData} from './getFileData';
import {walkContentNodes} from './walkContentNodes';
import {fromMarkdown} from 'mdast-util-from-markdown';
import {getTextContent} from '../serialize/TextContent';
import {pagesUrl} from './url';

export interface PageData extends FileData {
    pathname: string,
    title: string,
}

export const getPageData = async (...args: Parameters<typeof findPageData>): Promise<PageData> => {
    const pageData = await findPageData(...args);
    if (!pageData) {
        throw new Error(`NoPageData: ${args[0]}`);
    }
    return pageData;
};

export const findPageData = async (
    fileUrl: URL,
): Promise<PageData | null> => {
    const pathname = getPathName(fileUrl);
    if (!pathname) {
        return null;
    }
    const code = await fs.promises.readFile(fileUrl, 'utf8');
    const ext = getExtension(fileUrl.pathname);
    let title = '';
    switch (ext) {
    case '.md':
        title = getTitleFromMarkdown(code);
        break;
    default:
    }
    const fileData = await getFileData(fileUrl);
    return {pathname, title, ...fileData};
};

const getPathName = (
    fileUrl: URL,
): string | null => {
    let pathname = fileUrl.pathname.slice(pagesUrl.pathname.length);
    if (pathname.endsWith('.page.md')) {
        pathname = pathname.slice(0, -8);
    } else {
        const basename = pathname.slice(pathname.lastIndexOf('/') + 1);
        if (basename.startsWith('_')) {
            return null;
        }
        const extname = getExtension(pathname);
        switch (extname) {
        case '.ts':
        case '.js':
        case '.tsx':
        case '.jsx':
            pathname = pathname.slice(0, -extname.length);
            break;
        default:
            return null;
        }
    }
    if (pathname.endsWith('/index')) {
        pathname = pathname.slice(0, -5);
    }
    return pathname;
};

const getTitleFromMarkdown = (code: string): string => {
    for (const node of walkContentNodes(...fromMarkdown(code).children)) {
        if (node.type === 'heading' && node.depth === 1) {
            return getTextContent(node);
        }
    }
    return '';
};
