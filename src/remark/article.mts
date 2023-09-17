/* eslint-disable max-lines-per-function */
import type { Root, Parent, Text } from 'mdast';

import { SKIP } from 'unist-util-visit';
import { getSingle } from '../util/getSingle.mts';
import type { VFileLike } from '../util/unified.mts';
import type { MdastElementVisitor } from './visitMdastElement.mts';
import { visitMdastElement } from './visitMdastElement.mts';

const remarkArticle = () => (tree: Root, _file: VFileLike) => {
  visitMdastElement(tree, {
    math: visitMath,
  });
  return tree;
};

interface BlockMath extends Parent {
  value: string;
}

const visitMath: MdastElementVisitor<BlockMath> = (node) => {
  const text = getSingle(node.data?.hChildren as Array<Text>);
  if (!text) {
    return null;
  }
  node.value = text.value = `\\begin{align}\n${text.value}\n\\end{align}`;
  return SKIP;
};

export default remarkArticle;
