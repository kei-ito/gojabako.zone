export interface Commit {
  commit: string;
  abbr: string;
  aDate: string;
}

export interface PageData {
  url: string;
  filePath: string;
  title: string;
  publishedAt: string;
  updatedAt: string;
  commits: number;
}
