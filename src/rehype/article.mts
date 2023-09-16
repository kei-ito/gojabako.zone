/* eslint-disable max-lines-per-function */
import { isNonNegativeSafeInteger, isString } from '@nlib/typing';
import type { Root } from 'hast';
import { SKIP, visit } from 'unist-util-visit';
import type { VFileLike } from '../util/unified.mts';
import { createRehypeElement } from './createRehypeElement.mts';
import { insertArticleHeader } from './insertArticleHeader.mts';
import { insertFootnoteFocus } from './insertFootnoteFocus.mts';
import { insertLineNumbers } from './insertLineNumbers.mts';
import { isHastElement } from './isHastElement.mts';

const rehypeArticle = () => (tree: Root, file: VFileLike) => {
  let codeBlockNumber = 0;
  visit(tree, 'element', (node, index, parent) => {
    if (!parent || !isNonNegativeSafeInteger(index)) {
      return null;
    }
    if (isHastElement(node, 'div', ['math-display'])) {
      parent.children.splice(
        index,
        1,
        createRehypeElement('figure', { dataType: 'math' }, ...node.children),
      );
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
        const value = code.data?.meta;
        const id = (code.properties.id = `C${++codeBlockNumber}`);
        insertLineNumbers(code, id);
        parent.children.splice(
          index,
          1,
          createRehypeElement(
            'figure',
            { dataType: 'code' },
            node,
            isString(value) && createRehypeElement('figcaption', {}, value),
          ),
        );
        return SKIP;
      }
    }
    return null;
  });
  insertArticleHeader(tree, file);
  return tree;
};

export default rehypeArticle;
