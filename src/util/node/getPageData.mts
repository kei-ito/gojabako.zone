import type { Metadata } from 'next';
import type { PageData } from '../type.mts';
import { appDir, rootDir } from './directories.mts';
import { getPageTitleFromMdx } from './getMetadataFromMdx.mts';
import { getMetadataFromScript } from './getMetadataFromScript.mts';
import { listCommits } from './listCommits.mts';

export const getPageData = async (file: URL): Promise<PageData> => {
  const [history, metadata] = await Promise.all([
    scanCommits(file),
    getMetadata(file),
  ]);
  if (!metadata?.title) {
    throw new Error(`NoTitle: ${file.pathname.slice(rootDir.pathname.length)}`);
  }
  let url = file.pathname.slice(appDir.pathname.length - 1);
  url = url.replace(/\/page\.\w+$/, '');
  url = url.replace(/\([^/]+\)\//, '');
  return {
    ...metadata,
    url: url || '/',
    filePath: file.pathname.slice(rootDir.pathname.length),
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

export const getMetadata = async (file: URL): Promise<Metadata | null> => {
  switch (file.pathname.slice(file.pathname.lastIndexOf('.'))) {
    case '.mdx':
      return await getPageTitleFromMdx(file);
    case '.mts':
    case '.tsx':
      return await getMetadataFromScript(file);
    default:
      return null;
  }
};
