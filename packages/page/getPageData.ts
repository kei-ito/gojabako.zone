import {getPagePathName} from '../es/getPagePathName';
import {Error, Promise} from '../es/global';
import {getFileData} from '../node/getFileData';
import {getPageTitle} from './getPageTitle';

export interface PageData {
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
    const pathname = getPagePathName(fileUrl);
    if (pathname === null || pathname.startsWith('/api/')) {
        return null;
    }
    const [
        title,
        {filePath, firstCommitAt, lastCommitAt, commitCount},
    ] = await Promise.all([
        getPageTitle(pathname, fileUrl),
        getFileData(fileUrl),
    ]);
    const publishedAt = firstCommitAt;
    const updatedAt = lastCommitAt;
    return {pathname, title, filePath, publishedAt, updatedAt, commitCount};
};
