import type { Page } from '../type.mjs';
import { appDir, rootDir } from './directories.mjs';
import { getPageTitle } from './getPageTitle.mjs';
import { listCommits } from './listCommits.mjs';

export const getPageData = async (file: URL): Promise<Page> => {
  const [history, title] = await Promise.all([
    scanCommits(file),
    getPageTitle(file),
  ]);
  if (!title) {
    throw new Error(`NoTitle: ${file.pathname.slice(rootDir.pathname.length)}`);
  }
  let url = file.pathname.slice(appDir.pathname.length);
  url = url.replace(/\/page\.\w+$/, '');
  return {
    url,
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
