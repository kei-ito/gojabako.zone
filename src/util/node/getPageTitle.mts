import { getPageTitleFromMarkdown } from './getPageTitleFromMarkdown.mjs';
import { getPageTitleFromScript } from './getPageTitleFromScript.mjs';

export const getPageTitle = async (file: URL): Promise<string | null> => {
  switch (file.pathname.slice(file.pathname.lastIndexOf('.'))) {
    case '.mdx':
    case '.md':
      return await getPageTitleFromMarkdown(file);
    case '.mts':
    case '.tsx':
      return await getPageTitleFromScript(file);
    default:
      return null;
  }
};
