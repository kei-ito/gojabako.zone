import {getFileData} from './getFileData';
import {getPageTitle} from './getPageTitle';
import {getPathName} from './getPathName';
import {loadPackageJson} from './loadPackageJson';

export interface PageData {
    url: string,
    pathname: string,
    title: string,
    filePath: string,
    publishedAt: string,
    updatedAt: string,
    commitCount: number,
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
    const [
        title,
        {filePath, firstCommitAt, lastCommitAt, commitCount},
        {homepage},
    ] = await Promise.all([
        getPageTitle(pathname, fileUrl),
        getFileData(fileUrl),
        loadPackageJson(),
    ]);
    const url = new URL(pathname, homepage).href;
    const publishedAt = firstCommitAt;
    const updatedAt = lastCommitAt;
    return {pathname, url, title, filePath, publishedAt, updatedAt, commitCount};
};
