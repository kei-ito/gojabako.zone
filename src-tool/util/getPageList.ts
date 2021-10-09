import type {PageData} from './getPageData';
import {listPages} from './listPages';

const byDate = (date1: string, date2: string) => {
    const now = Date.now();
    const t1 = date1 ? new Date(date1).getTime() : now;
    const t2 = date2 ? new Date(date2).getTime() : now;
    return t1 < t2 ? 1 : -1;
};
const byPublishedAt = (page1: PageData, page2: PageData) => byDate(page1.publishedAt, page2.publishedAt);
const byUpdatedAt = (page1: PageData, page2: PageData) => byDate(page1.updatedAt, page2.updatedAt);

export const getPageList = async () => {
    const pageList: Array<PageData> = [];
    for await (const page of listPages()) {
        pageList.push(page);
    }
    const pageListByPublishedAt = pageList.sort(byPublishedAt);
    const indexMapping = new WeakMap(pageListByPublishedAt.map((page, index) => [page, index]));
    const pageListByUpdatedAt = pageList.sort(byUpdatedAt);
    return {
        pageList: pageListByPublishedAt,
        toListByUpdatedAt: pageListByUpdatedAt.map((page) => {
            const index = indexMapping.get(page);
            if (typeof index !== 'number') {
                throw new Error(`UnexpectedPage: ${JSON.stringify(page, null, 2)}`);
            }
            return index;
        }),
    };
};
