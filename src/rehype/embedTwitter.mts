import type { Element } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import { toString as hastToString } from 'hast-util-to-string';
import { EXIT, visit } from 'unist-util-visit';

export const embedTwitter = (node: Element): Array<Element> => {
  const result: Array<Element> = [];
  visit(fromHtml(hastToString(node)), 'element', (e) => {
    if (e.tagName !== 'blockquote') {
      return null;
    }
    e.position = node.position;
    result.push(e);
    return [EXIT];
  });
  return result;
};
