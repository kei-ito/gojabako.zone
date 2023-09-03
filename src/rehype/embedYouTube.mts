import type { Element } from 'hast';
import rehypeParse from 'rehype-parse';
import { unified } from 'unified';
import { EXIT, visit } from 'unist-util-visit';
import { getTextContent } from './getTextContent.mjs';

export const embedYouTube = (node: Element): Array<Element> => {
  const result: Array<Element> = [];
  visit(
    unified().use(rehypeParse, { fragment: true }).parse(getTextContent(node)),
    'element',
    (e) => {
      if (e.tagName !== 'iframe') {
        return null;
      }
      e.position = node.position;
      result.push(e);
      return [EXIT];
    },
  );
  return result;
};
