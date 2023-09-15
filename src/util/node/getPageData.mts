import type { Page } from '../type.mjs';
import { appDir, rootDir } from './directories.mjs';
import { listCommits } from './listCommits.mjs';

export const getPageData = async (file: URL): Promise<Page> => {
  const relativePath = file.pathname.slice(rootDir.pathname.length);
  let publishedAt = new Date().toISOString();
  let updatedAt = '';
  let commits = 0;
  for await (const { aDate } of listCommits(relativePath)) {
    commits += 1;
    if (!updatedAt) {
      updatedAt = aDate;
    }
    publishedAt = aDate;
  }
  let url = file.pathname.slice(appDir.pathname.length);
  url = url.replace(/(\/index)?\.page\.\w+$/, '');
  return {
    url,
    filePath: file.pathname.slice(rootDir.pathname.length),
    publishedAt,
    updatedAt: updatedAt || publishedAt,
    commits,
  };
};
