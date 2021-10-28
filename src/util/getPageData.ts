import {Error} from '../../packages/es/global';
import type {PageData} from '../pageList';
import {pageListByPublishedAt} from '../pageList';

export const getPageData = (pathname: string): PageData => {
    for (const page of pageListByPublishedAt) {
        if (page.pathname === pathname) {
            return page;
        }
    }
    throw new Error(`NoSuchPage: ${pathname}`);
};
