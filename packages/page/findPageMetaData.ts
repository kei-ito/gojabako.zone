import {Promise} from '../es/global';
import {getFileData} from '../node/getFileData';
import {getPagePathName} from './getPagePathName';
import {loadPageMetaDataPatch} from './loadPageMetaDataPatch';

/** TODO */
const getPageTitle = (s?: string) => `page-${s}`;

export interface PageMetaDataPatch {
    title?: string,
    archiveOf?: string,
    publishedAt?: string,
    description?: string,
}
export interface PageMetaData {
    pathname: string,
    title: string,
    filePath: string,
    updatedAt: string,
    publishedAt: string,
    commitCount: number,
    description?: string,
}

export const findPageMetaData = async (pageFileAbsolutePath: string): Promise<PageMetaData | null> => {
    const pathname = getPagePathName(pageFileAbsolutePath);
    if (pathname.startsWith('/api/')) {
        return null;
    }
    const [
        title,
        {filePath, firstCommitAt, lastCommitAt, commitCount},
        patch,
    ] = await Promise.all([
        getPageTitle(pageFileAbsolutePath),
        getFileData(pageFileAbsolutePath),
        loadPageMetaDataPatch(pageFileAbsolutePath),
    ]);
    const publishedAt = firstCommitAt;
    const updatedAt = lastCommitAt;
    return {pathname, title, filePath, publishedAt, updatedAt, commitCount, ...patch};
};
