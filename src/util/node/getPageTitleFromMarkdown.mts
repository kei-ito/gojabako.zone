import { readFile } from 'node:fs/promises';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString } from 'mdast-util-to-string';
import { getPageTitleFromScript } from './getPageTitleFromScript.mts';

export const getPageTitleFromMarkdown = async (
  file: URL,
): Promise<string | null> => {
  for (const child of fromMarkdown(await readFile(file, 'utf8')).children) {
    switch (child.type) {
      case 'paragraph': {
        const text = toString(child);
        if (text.startsWith('export const metadata = {')) {
          return await getPageTitleFromScript(file, text);
        }
        break;
      }
      default:
    }
  }
  return null;
};
