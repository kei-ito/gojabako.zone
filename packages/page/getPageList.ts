import {Date, Error, JSON, WeakMap} from '../es/global';
import type {PageMetaData} from './findPageMetaData';
import {listPageMetaData} from './listPageMetaData';

const byDate = (date1: string, date2: string) => {
    const now = Date.now();
    const t1 = date1 ? new Date(date1).getTime() : now;
    const t2 = date2 ? new Date(date2).getTime() : now;
    return t1 < t2 ? 1 : -1;
};
const byPublishedAt = (page1: PageMetaData, page2: PageMetaData) => byDate(page1.publishedAt, page2.publishedAt);
const byUpdatedAt = (page1: PageMetaData, page2: PageMetaData) => byDate(page1.updatedAt, page2.updatedAt);

export const getPageList = async () => {
    const pageList: Array<PageMetaData> = [];
    for await (const pageData of listPageMetaData()) {
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
