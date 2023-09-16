/* eslint-disable max-lines-per-function */
import { isNonNegativeSafeInteger } from '@nlib/typing';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import type { VFileLike } from '../util/unified.mts';

const remarkArticle = () => (tree: Root, _file: VFileLike) => {
  visit(tree, (_node, index, parent) => {
    if (!parent || !isNonNegativeSafeInteger(index)) {
      return null;
    }
    return null;
  });
  return tree;
};

export default remarkArticle;
