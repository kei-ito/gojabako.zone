import type { Element } from 'hast';
import { EXIT } from 'unist-util-visit';
import { hasClass } from './className.mts';
import { visitHastElement } from './visitHastElement.mts';

export const getKatexHtml = (element: Element) => {
  let katexHtml: Element | undefined;
  visitHastElement(element, {
    span: (span) => {
      if (hasClass(span, 'katex-html')) {
        katexHtml = span;
        return EXIT;
      }
      return null;
    },
  });
  return katexHtml;
};
