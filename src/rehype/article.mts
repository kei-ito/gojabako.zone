import { isNonNegativeSafeInteger, isString } from '@nlib/typing';
import type { Element, Root } from 'hast';
import type { Transformer } from 'unified';
import { SKIP, visit } from 'unist-util-visit';
import { insertLineNumbers } from './insertLineNumbers.mjs';
import { isHastElement } from './isHastElement.mjs';

// eslint-disable-next-line max-lines-per-function
const rehypeArticle = (): Transformer<Root> => (tree, _file) => {
  let codeBlockNumber = 0;
  visit(
    tree,
    'element',
    // eslint-disable-next-line max-lines-per-function
    (node, index, parent) => {
      if (!parent || !isNonNegativeSafeInteger(index)) {
        return null;
      }
      if (isHastElement(node, 'div', ['math-display'])) {
        parent.children.splice(index, 1, {
          type: 'element',
          tagName: 'figure',
          properties: { dataType: 'math' },
          children: node.children,
          position: node.position,
        });
        return SKIP;
      }
      if (isHastElement(node, 'sup')) {
        if (node.children.length !== 1) {
          return null;
        }
        const [a] = node.children;
        if (
          !isHastElement(a, 'a') ||
          !('properties' in a) ||
          !a.properties.dataFootnoteRef
        ) {
          return null;
        }
        insertFootnoteFocus(node, a);
        return SKIP;
      }
      if (isHastElement(node, 'pre') && node.children.length === 1) {
        const [code] = node.children;
        if (isHastElement(code, 'code', ['hljs'])) {
          const children: Array<Element> = [node];
          if ('data' in code) {
            const value = code.data?.meta;
            if (isString(value)) {
              children.unshift({
                type: 'element',
                tagName: 'figcaption',
                properties: {},
                children: [{ type: 'text', value }],
              });
            }
          }
          insertLineNumbers(code, ++codeBlockNumber);
          parent.children.splice(index, 1, {
            type: 'element',
            tagName: 'figure',
            properties: { dataType: 'code' },
            children,
          });
          return SKIP;
        }
      }
      return null;
    },
  );
  return tree;
};

const insertFootnoteFocus = (node: Element, a: Element) => {
  node.children.push({
    type: 'element',
    tagName: 'span',
    properties: { dataFootnoteFocus: true, id: a.properties.id },
    children: [],
  });
  delete a.properties.id;
  node.properties.dataFootnoteRef = true;
  delete a.properties.dataFootnoteRef;
};

export default rehypeArticle;
