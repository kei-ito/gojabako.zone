import {getPagePathName} from './getPagePathName';
import {Promise} from '../es/global';
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

export const findPageData = async (pageFileAbsolutePath: string): Promise<PageData | null> => {
    const pathname = getPagePathName(pageFileAbsolutePath);
    if (pathname.startsWith('/api/')) {
        return null;
    }
    const [
        title,
        {filePath, firstCommitAt, lastCommitAt, commitCount},
    ] = await Promise.all([
        getPageTitle(pageFileAbsolutePath),
        getFileData(pageFileAbsolutePath),
    ]);
    const publishedAt = firstCommitAt;
    const updatedAt = lastCommitAt;
    return {pathname, title, filePath, publishedAt, updatedAt, commitCount};
};
