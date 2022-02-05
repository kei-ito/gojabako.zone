import {Error} from '../../packages/es/global';
import type {PageData} from '../pageList';
import {pageListByPublishedAt} from '../pageList';

export const getPageData = (pathname: string): PageData => {
    const normalized = pathname.replace(/\/$/, '');
    for (const page of pageListByPublishedAt) {
        if (page.pathname === pathname || page.pathname === normalized) {
            return page;
        }
    }
    throw new Error(`NoSuchPage: ${pathname} (${normalized})`);
};
