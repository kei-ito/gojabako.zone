import {Map} from '../../packages/es/global';
import type {PageData} from '../pageList';
import {pageListByPublishedAt} from '../pageList';

const blogPost = new Map<string, Array<PageData>>();
const others: Array<PageData> = [];

for (const page of pageListByPublishedAt) {
    const matched = (/^\/(\d+)\//).exec(page.pathname);
    if (matched) {
        const year = matched[1];
        let list = blogPost.get(year);
        if (!list) {
            list = [];
            blogPost.set(year, list);
        }
        list.push(page);
    } else {
        others.push(page);
    }
}

export const categorizedPageListByPublishedAt = {
    blogPost: [...blogPost].sort((a, b) => a[0] < b[0] ? 1 : -1),
    others,
};
