import type { PageData } from '../type.mts';
import { appDir, rootDir } from './directories.mts';
import { getPageTitle } from './getPageTitle.mts';
import { listCommits } from './listCommits.mts';

export const getPageData = async (file: URL): Promise<PageData> => {
  const [history, title] = await Promise.all([
    scanCommits(file),
    getPageTitle(file),
  ]);
  if (!title) {
    throw new Error(`NoTitle: ${file.pathname.slice(rootDir.pathname.length)}`);
  }
  let url = file.pathname.slice(appDir.pathname.length - 1);
  url = url.replace(/\/page\.\w+$/, '');
  url = url.replace(/\([^/]+\)\//, '');
  return {
    url: url || '/',
    filePath: file.pathname.slice(rootDir.pathname.length),
    title,
    ...history,
  };
};

const scanCommits = async (file: URL) => {
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
  return { publishedAt, updatedAt: updatedAt || publishedAt, commits };
};
