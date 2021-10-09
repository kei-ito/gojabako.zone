import type {PageData} from './getPageData';
import {listPages} from './listPages';

const byLastCommitDate = (
    {lastCommitAt: date1}: PageData,
    {lastCommitAt: date2}: PageData,
) => {
    const now = Date.now();
    const t1 = date1 ? new Date(date1).getTime() : now;
    const t2 = date2 ? new Date(date2).getTime() : now;
    return t1 < t2 ? -1 : 1;
};

export const getPageList = async (): Promise<Array<PageData>> => {
    const pageList: Array<PageData> = [];
    for await (const page of listPages()) {
        pageList.push(page);
    }
    return pageList.sort(byLastCommitDate);
};
