import { readdir } from 'node:fs/promises';
import { isString } from '@nlib/typing';
import type { Metadata } from 'next';
import { site } from '../site.mts';
import type { PageData } from '../type.mts';
import { appDir, rootDir } from './directories.mts';
import { getPageTitleFromMdx } from './getMetadataFromMdx.mts';
import { getMetadataFromScript } from './getMetadataFromScript.mts';
import { listCommits } from './listCommits.mts';
import { getTokenizer, listPhrases } from './listPhrases.mts';

const knownTitles = new Map<string, string>();
knownTitles.set('/', 'Home');

export const getPageData = async (file: URL): Promise<PageData> => {
  let pagePath = file.pathname.slice(appDir.pathname.length - 1);
  pagePath = pagePath.replace(/\/page\.\w+$/, '');
  pagePath = pagePath.replace(/\([^/]+\)\//, '') || '/';
  const [history, metadata, tokenizer] = await Promise.all([
    scanCommits(file),
    getMetadata(file),
    getTokenizer(),
  ]);
  const title = metadata?.title ?? knownTitles.get(pagePath);
  if (!isString(title)) {
    const relativePath = file.pathname.slice(rootDir.pathname.length);
    throw new Error(`${title ? 'Invalid' : 'No'}Title: ${relativePath}`);
  }
  const group = /^\/(.*)\/.*?$/.exec(pagePath);
  return {
    ...metadata,
    ...history,
    title: [...listPhrases(tokenizer, title)],
    path: pagePath,
    iri: site.iri(pagePath),
    group: group ? group[1] : '',
    filePath: file.pathname.slice(rootDir.pathname.length),
  };
};

const scanCommits = async (pageFile: URL) => {
  let publishedAt = Date.now();
  let updatedAt = 0;
  const commits = new Set<string>();
  const tasks: Array<Promise<GitStats>> = [];
  for await (const file of listFiles(pageFile)) {
    tasks.push(getCommits(file));
  }
  for (const stats of await Promise.all(tasks)) {
    for (const commit of stats.commits) {
      commits.add(commit);
    }
    if (stats.publishedAt < publishedAt) {
      publishedAt = stats.publishedAt;
    }
    if (updatedAt < stats.updatedAt) {
      updatedAt = stats.updatedAt;
    }
  }
  return {
    publishedAt: new Date(publishedAt).toISOString(),
    updatedAt: new Date(updatedAt).toISOString(),
    commits: commits.size,
  };
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

const listFiles = async function* (file: URL): AsyncGenerator<URL> {
  if (file.pathname.endsWith('src/app/page.tsx')) {
    yield file;
  } else {
    for (const name of await readdir(new URL('./', file))) {
      yield new URL(name, file);
    }
  }
};

interface GitStats {
  publishedAt: number;
  updatedAt: number;
  commits: Set<string>;
}

const getCommits = async (file: URL): Promise<GitStats> => {
  let publishedAt = Date.now();
  let updatedAt = 0;
  const commits = new Set<string>();
  for await (const { commit, aDate } of listCommits(file)) {
    commits.add(commit);
    if (aDate < publishedAt) {
      publishedAt = aDate;
    }
    if (updatedAt < aDate) {
      updatedAt = aDate;
    }
  }
  return { publishedAt, updatedAt, commits };
};
