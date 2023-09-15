import { getPageTitleFromMarkdown } from './getPageTitleFromMarkdown.mjs';

export const getPageTitle = async (file: URL): Promise<string | null> => {
  switch (file.pathname.slice(file.pathname.lastIndexOf('.'))) {
    case '.mdx':
    case '.md':
      return await getPageTitleFromMarkdown(file);
    default:
      return null;
  }
};
