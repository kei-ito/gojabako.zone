import {useMemo} from 'react';
import {Error} from '../../packages/es/global';
import {pageListByPublishedAt} from '../pageList';

export const usePageData = (pathname: string) => useMemo(() => {
    const normalized = pathname.replace(/\/$/, '');
    for (const page of pageListByPublishedAt) {
        if (page.pathname === pathname || page.pathname === normalized) {
            return page;
        }
    }
    throw new Error(`NoSuchPage: ${pathname} (${normalized})`);
}, [pathname]);
