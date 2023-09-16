/* eslint-disable max-lines-per-function */
import { isNonNegativeSafeInteger } from '@nlib/typing';
import type { Root } from 'mdast';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';

const remarkArticle = (): Transformer<Root> => (tree, _file) => {
  visit(tree, (_node, index, parent) => {
    if (!parent || !isNonNegativeSafeInteger(index)) {
      return null;
    }
    return null;
  });
  return tree;
};

export default remarkArticle;
