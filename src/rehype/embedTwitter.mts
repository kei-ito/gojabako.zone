import type { Element } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import rehypeParse from 'rehype-parse';
import { unified } from 'unified';
import { EXIT, visit } from 'unist-util-visit';

export const embedTwitter = (node: Element): Array<Element> => {
  const result: Array<Element> = [];
  visit(
    unified().use(rehypeParse, { fragment: true }).parse(hastToString(node)),
    'element',
    (e) => {
      if (e.tagName !== 'blockquote') {
        return null;
      }
      e.position = node.position;
      result.push(e);
      return [EXIT];
    },
  );
  return result;
};
