import { isString } from "@nlib/typing";
import type { Metadata } from "next";
import { site } from "../site.ts";
import type { PageData } from "../type.ts";
import { appDir, rootDir } from "./directories.ts";
import { getMetadataFromMdx } from "./getMetadataFromMdx.ts";
import { getMetadataFromScript } from "./getMetadataFromScript.ts";
import { listCommits } from "./listCommits.ts";
import { getTokenizer, listPhrases } from "./listPhrases.ts";

const knownTitles = new Map<string, string>();
knownTitles.set("/", "Home");

export const getPageData = async (file: URL): Promise<PageData> => {
	let pagePath = file.pathname.slice(appDir.pathname.length - 1);
	pagePath = pagePath.replace(/\/page\.\w+$/, "");
	pagePath = pagePath.replace(/\([^/]+\)\//, "");
	pagePath = pagePath.replace(/\/\[+[^\]]*\]+/, "");
	pagePath = pagePath || "/";
	const [history, metadata, tokenizer] = await Promise.all([
		getCommits(file),
		getMetadata(file),
		getTokenizer(),
	]);
	let title = metadata?.title ?? knownTitles.get(pagePath);
	if (!isString(title)) {
		const relativePath = file.pathname.slice(rootDir.pathname.length);
		console.warn(
			new Error(`${title ? "Invalid" : "No"}Title: ${relativePath}`),
		);
		title = "";
	}
	return {
		...metadata,
		...history,
		publishedAt: getPublishedAt(history, metadata),
		title: [...listPhrases(tokenizer, title)],
		path: pagePath,
		iri: site.iri(pagePath),
		group: getGroup(pagePath),
		filePath: file.pathname.slice(rootDir.pathname.length),
	};
};

const getGroup = (pagePath: string): string => {
	const group = /^\/(.*)\/.*?$/.exec(pagePath)?.[1] ?? "";
	switch (group) {
		case "stories":
			return "";
		default:
			return group;
	}
};

export const getMetadata = async (file: URL): Promise<Metadata | null> => {
	switch (file.pathname.slice(file.pathname.lastIndexOf("."))) {
		case ".mdx":
			return await getMetadataFromMdx(file);
		case ".ts":
		case ".tsx":
			return await getMetadataFromScript(file);
		default:
			return null;
	}
};

const getCommits = async (file: URL) => {
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
	return {
		publishedAt: new Date(publishedAt).toISOString(),
		updatedAt: new Date(updatedAt).toISOString(),
		commits: commits.size,
	};
};

const getPublishedAt = (
	history: { publishedAt: string },
	metadata: Metadata | null,
) => {
	const originalPublishedAt = metadata?.other?.originalPublishedAt;
	const originalLocation = metadata?.other?.originalLocation;
	if (isString(originalPublishedAt) && isString(originalLocation)) {
		return originalPublishedAt;
	}
	return history.publishedAt;
};
