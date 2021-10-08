import {getExtension} from './getExtension';
import type {FileData} from './getFileData';
import {getFileData} from './getFileData';
import {getPageTitle} from './getPageTitle';
import {loadPackageJson} from './loadPackageJson';
import {pagesUrl} from './url';

export interface PageData extends FileData {
    url: URL,
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
    const [title, fileData, {homepage}] = await Promise.all([
        getPageTitle(fileUrl),
        getFileData(fileUrl),
        loadPackageJson(),
    ]);
    const url = new URL(pathname, homepage);
    return {pathname, url, title, ...fileData};
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
