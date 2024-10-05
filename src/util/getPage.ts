import { rootDir } from "./node/directories.ts";
import { pageList } from "./pageList.ts";
import type { PageData } from "./type.ts";

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
