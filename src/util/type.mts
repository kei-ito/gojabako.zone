export interface Commit {
  commit: string;
  abbr: string;
  aDate: string;
}

export interface Page {
  url: string;
  filePath: string;
  publishedAt: string;
  updatedAt: string;
  commits: number;
}
