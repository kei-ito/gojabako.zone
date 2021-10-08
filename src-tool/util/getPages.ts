import type {PageData} from './getPageData';
import {listPages} from './listPages';

export const getPages = async (): Promise<Array<PageData>> => {
    const pages: Array<PageData> = [];
    for await (const page of listPages()) {
        pages.push(page);
    }
    return pages;
};
