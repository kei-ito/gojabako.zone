import * as path from 'path';
import {listFiles} from '../node/listFiles';
import type {PageData} from './getPageData';
import {findPageData} from './getPageData';
import {Date, Error, JSON, WeakMap} from '../es/global';
import {rootDirectoryPath} from '../fs/constants';

const isPageFile = (filePath: string) => !filePath.endsWith('.component.tsx')
&& (
    (/\.tsx?$/).test(filePath)
    || filePath.endsWith('.page.md')
);
const byDate = (date1: string, date2: string) => {
    const now = Date.now();
    const t1 = date1 ? new Date(date1).getTime() : now;
    const t2 = date2 ? new Date(date2).getTime() : now;
    return t1 < t2 ? 1 : -1;
};
const byPublishedAt = (page1: PageData, page2: PageData) => byDate(page1.publishedAt, page2.publishedAt);
const byUpdatedAt = (page1: PageData, page2: PageData) => byDate(page1.updatedAt, page2.updatedAt);
const listPageData = async function* () {
    for await (const fileUrl of listFiles(path.join(rootDirectoryPath, 'src/pages'))) {
        if (isPageFile(fileUrl)) {
            const pageData = await findPageData(fileUrl);
            if (pageData) {
                yield pageData;
            }
        }
    }
};

export const getPageList = async () => {
    const pageList: Array<PageData> = [];
    for await (const pageData of listPageData()) {
        pageList.push(pageData);
    }
    const pageListByPublishedAt = pageList.slice().sort(byPublishedAt);
    const indexMapping = new WeakMap(pageListByPublishedAt.map((page, index) => [page, index]));
    const pageListByUpdatedAt = pageList.slice().sort(byUpdatedAt);
    return {
        pageListByPublishedAt,
        toListByUpdatedAt: pageListByUpdatedAt.map((page) => {
            const index = indexMapping.get(page);
            if (typeof index !== 'number') {
                throw new Error(`UnexpectedPage: ${JSON.stringify(page, null, 2)}`);
            }
            return index;
        }),
    };
};
