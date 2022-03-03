import {useMemo} from 'react';
import {Error} from '../es/global';
import {pageListByPublishedAt} from '../site/pageList';

export const usePageData = (pathname: string) => useMemo(() => {
    for (const page of pageListByPublishedAt) {
        if (page.pathname === pathname) {
            return page;
        }
    }
    throw new Error(`NoSuchPage: ${pathname}`);
}, [pathname]);
