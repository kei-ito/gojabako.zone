import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isString } from '@nlib/typing';
import type { PageMetaData } from '../extractPageMetaDataFromHtml.mts';
import { extractPageMetaDataFromHtml } from '../extractPageMetaDataFromHtml.mts';
import { cacheDir } from './directories.mts';
import { getHash } from './getHash.mts';
import { ignoreENOENT } from './ignoreENOENT.mts';

const sessionCache = new Map<string, PageMetaData>();
const fnCacheDir = new URL('fetchWebPageMetaData/', cacheDir);
const getCacheDest = (pageUrl: URL) =>
  new URL(`${getHash(pageUrl.href)}.json`, fnCacheDir);
const getCache = async (pageUrl: URL) => {
  let cached = sessionCache.get(pageUrl.href) ?? null;
  if (!cached) {
    const cacheDest = getCacheDest(pageUrl);
    const json = await readFile(cacheDest, 'utf8').catch(ignoreENOENT);
    if (json) {
      const parsed: unknown = JSON.parse(json);
      if (isString.array.dictionary(parsed)) {
        cached = parsed;
        sessionCache.set(pageUrl.href, cached);
      }
    }
  }
  return cached;
};
const cache = async (pageUrl: URL, data: PageMetaData) => {
  sessionCache.set(pageUrl.href, data);
  await mkdir(fnCacheDir, { recursive: true });
  const cacheDest = getCacheDest(pageUrl);
  await writeFile(cacheDest, JSON.stringify(data, null, 2));
};

export const fetchWebPageMetaData = async (
  pageUrl: URL,
): Promise<PageMetaData> => {
  const cached = await getCache(pageUrl);
  if (cached) {
    return cached;
  }
  const res = await fetch(pageUrl);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${pageUrl}`);
  }
  const data = extractPageMetaDataFromHtml(await res.text());
  await cache(pageUrl, data);
  return data;
};
