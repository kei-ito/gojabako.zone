import { readFile } from 'node:fs/promises';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString } from 'mdast-util-to-string';
import { getMetadataFromScript } from './getMetadataFromScript.mts';

export const getPageTitleFromMdx = async (file: URL) => {
  for (const child of fromMarkdown(await readFile(file, 'utf8')).children) {
    switch (child.type) {
      case 'paragraph': {
        const text = toString(child);
        if (text.startsWith('export const metadata = {')) {
          return await getMetadataFromScript(file, text);
        }
        break;
      }
      default:
    }
  }
  return null;
};
