import type { Metadata } from 'next';

export interface Commit {
  commit: string;
  abbr: string;
  aDate: number;
}

export interface PageData extends Metadata {
  title: string;
  url: string;
  iri: string;
  group: string;
  filePath: string;
  publishedAt: string;
  updatedAt: string;
  commits: number;
}
