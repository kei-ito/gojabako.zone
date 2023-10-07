/* eslint-disable func-style */
import { rootDir } from './node/directories.mts';
import { pageList } from './pageList.mts';
import type { PageData } from './type.mts';

export function getPageFromFileUrl(fileUrl: URL): PageData | null;
export function getPageFromFileUrl(fileUrl: URL, fallback: PageData): PageData;
export function getPageFromFileUrl(
  fileUrl: URL,
  fallback: PageData | null = null,
) {
  const filePath = fileUrl.pathname.slice(rootDir.pathname.length);
  for (const page of pageList) {
    if (page.filePath === filePath) {
      return page;
    }
  }
  return fallback;
}
