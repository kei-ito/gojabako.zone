import { useMemo } from 'react';
import { pageListByPublishedAt } from '../../generated.pageList.mjs';

export const usePageData = (pathname: string) =>
  useMemo(() => {
    for (const page of pageListByPublishedAt) {
      if (page.pathname === pathname) {
        return page;
      }
    }
    throw new Error(`NoSuchPage: ${pathname}`);
  }, [pathname]);
