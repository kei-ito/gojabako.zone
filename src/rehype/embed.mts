import { isNonNegativeSafeInteger, isString } from '@nlib/typing';
import type { Element, Root } from 'hast';
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import type { Transformer } from 'unified';
import { SKIP, visit } from 'unist-util-visit';
import { embedTwitter } from './embedTwitter.mjs';
import { embedYouTube } from './embedYouTube.mjs';
import { isHastElement } from './isHastElement.mjs';

declare module 'hast' {
  interface RootContentMap {
    mdxJsxFlowElement: MdxJsxFlowElement;
    mdxJsxTextElement: MdxJsxTextElement;
  }
}

const services = new Map<string, (e: Element) => Iterable<Element>>();
services.set('youtube', embedYouTube);
services.set('twitter', embedTwitter);

const rehypeEmbed = (): Transformer<Root> => (tree, _file) => {
  visit(tree, 'element', (node, index, parent) => {
    if (
      !parent ||
      !isNonNegativeSafeInteger(index) ||
      !isHastElement(node, 'pre') ||
      node.children.length !== 1
    ) {
      return null;
    }
    const codeElement = node.children[0];
    if (!isHastElement(codeElement, 'code')) {
      return null;
    }
    const { className } = codeElement.properties;
    if (!isString.array(className)) {
      return null;
    }
    const prefix = 'language-embed:';
    const i = className.findIndex((c) => c.startsWith(prefix));
    if (!(0 <= i)) {
      return null;
    }
    const service = className[i].slice(prefix.length);
    const fn = services.get(service);
    if (fn) {
      parent.children.splice(index, 1, ...fn(codeElement));
    } else {
      className[i] = 'language-html';
      codeElement.properties['data-embed'] = service;
    }
    return [SKIP, index];
  });
  return tree;
};

export default rehypeEmbed;
