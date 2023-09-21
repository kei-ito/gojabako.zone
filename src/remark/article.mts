/* eslint-disable max-lines-per-function */
import type { Root, Parent, Text, RootContentMap } from 'mdast';

import { SKIP } from 'unist-util-visit';
import { getSingle } from '../util/getSingle.mts';
import type { VFileLike } from '../util/unified.mts';
import type { MdastElementVisitor } from './visitMdastElement.mts';
import { visitMdastElement } from './visitMdastElement.mts';

interface BlockMath extends Parent {
  value: string;
}

interface ContentMap extends RootContentMap {
  math: BlockMath;
}

export const remarkArticle = () => (tree: Root, _file: VFileLike) => {
  visitMdastElement<ContentMap>(tree, {
    math: visitMath,
  });
  return tree;
};

const visitMath: MdastElementVisitor<BlockMath> = (node) => {
  const text = getSingle(node.data?.hChildren as Array<Text>);
  if (!text) {
    return null;
  }
  node.value = text.value = `\\begin{align}\n${text.value}\n\\end{align}`;
  return SKIP;
};
