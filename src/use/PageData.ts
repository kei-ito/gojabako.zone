import {useMemo} from 'react';
import {Error} from '../../packages/es/global';
import {pageListByPublishedAt} from '../pageList';

export const usePageData = (pathname: string) => useMemo(() => {
    for (const page of pageListByPublishedAt) {
        if (page.pathname === pathname) {
            return page;
        }
    }
    throw new Error(`NoSuchPage: ${pathname}`);
}, [pathname]);
