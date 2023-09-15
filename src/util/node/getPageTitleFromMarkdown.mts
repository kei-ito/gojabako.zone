import { readFile } from 'node:fs/promises';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString } from 'mdast-util-to-string';

export const getPageTitleFromMarkdown = async (
  file: URL,
): Promise<string | null> => {
  for (const child of fromMarkdown(await readFile(file, 'utf8')).children) {
    if (child.type === 'heading' && child.depth === 1) {
      return toString(child);
    }
  }
  return null;
};
