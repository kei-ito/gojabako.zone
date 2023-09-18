import type { Metadata } from 'next';

export interface Commit {
  commit: string;
  abbr: string;
  aDate: string;
}

export interface PageData extends Metadata {
  url: string;
  filePath: string;
  publishedAt: string;
  updatedAt: string;
  commits: number;
}
