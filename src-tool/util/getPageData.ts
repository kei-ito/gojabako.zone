import type {FileData} from './getFileData';
import {getFileData} from './getFileData';
import {getPageTitle} from './getPageTitle';
import {getPathName} from './getPathName';
import {loadPackageJson} from './loadPackageJson';

export interface PageData extends FileData {
    url: string,
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

export const findPageData = async (fileUrl: URL): Promise<PageData | null> => {
    const pathname = getPathName(fileUrl);
    if (pathname === null || pathname.startsWith('/api/')) {
        return null;
    }
    const [title, fileData, {homepage}] = await Promise.all([
        getPageTitle(fileUrl),
        getFileData(fileUrl),
        loadPackageJson(),
    ]);
    const url = new URL(pathname, homepage).href;
    return {pathname, url, title, ...fileData};
};
