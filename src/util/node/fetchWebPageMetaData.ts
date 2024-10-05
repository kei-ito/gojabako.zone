import { mkdir, readFile, writeFile } from "node:fs/promises";
import { isArrayOf, isDictionaryOf, isString } from "@nlib/typing";
import type { PageMetaData } from "../extractPageMetaDataFromHtml.ts";
import { extractPageMetaDataFromHtml } from "../extractPageMetaDataFromHtml.ts";
import { cacheDir } from "./directories.ts";
import { getHash } from "./getHash.ts";
import { ignoreENOENT } from "./ignoreENOENT.ts";

const sessionCache = new Map<string, PageMetaData>();
const fnCacheDir = new URL("fetchWebPageMetaData/", cacheDir);
const getCacheDest = (pageUrl: URL) =>
	new URL(`${getHash(pageUrl.href)}.json`, fnCacheDir);
const getCache = async (pageUrl: URL) => {
	let cached = sessionCache.get(pageUrl.href) ?? null;
	if (!cached) {
		const cacheDest = getCacheDest(pageUrl);
		const json = await readFile(cacheDest, "utf8").catch(ignoreENOENT());
		if (json) {
			const parsed: unknown = JSON.parse(json);
			if (isDictionaryOf(isArrayOf(isString))(parsed)) {
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
