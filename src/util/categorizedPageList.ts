import type {PageData} from '../pageList';
import {pageListByPublishedAt} from '../pageList';

interface CategorizedPageList {
    blogPost: Array<PageData>,
    others: Array<PageData>,
}

const reducer = (result: CategorizedPageList, page: PageData) => {
    if ((/^\/\d+\//).test(page.pathname)) {
        result.blogPost.push(page);
    } else {
        result.others.push(page);
    }
    return result;
};

const init = (): CategorizedPageList => ({blogPost: [], others: []});

export const categorizedPageListByPublishedAt = pageListByPublishedAt.reduce(reducer, init());
// export const categorizedPageListByUpdatedAt = pageListByUpdatedAt.reduce(reducer, init());
