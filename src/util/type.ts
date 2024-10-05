import type { Metadata } from "next";

export interface Commit {
	commit: string;
	abbr: string;
	aDate: number;
}

export interface PageData extends Omit<Metadata, "title"> {
	title: Array<string>;
	path: string;
	iri: string;
	group: string;
	filePath: string;
	publishedAt: string;
	updatedAt: string;
	commits: number;
}
