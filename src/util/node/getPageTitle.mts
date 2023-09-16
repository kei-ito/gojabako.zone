import { getPageTitleFromMarkdown } from './getPageTitleFromMarkdown.mts';
import { getPageTitleFromScript } from './getPageTitleFromScript.mts';

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
