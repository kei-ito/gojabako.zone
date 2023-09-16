import { rootDir } from './node/directories.mts';
import { pageList } from './pageList.mts';
import type { Page } from './type.mts';

const defaultFallback: Page = {
  url: '/not-found',
  filePath: 'app/not-found.tsx',
  title: 'Not Found',
  publishedAt: '1970-01-01T00:00:00Z',
  updatedAt: '1970-01-01T00:00:00Z',
  commits: 6,
};

export const getPageFromFileUrl = (
  fileUrl: URL,
  fallback: Partial<Page> = {},
): Page => {
  const filePath = fileUrl.pathname.slice(rootDir.pathname.length);
  for (const page of pageList) {
    if (page.filePath === filePath) {
      return page;
    }
  }
  return { ...defaultFallback, ...fallback };
};
