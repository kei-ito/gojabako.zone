import type { Root } from 'hast';
import type { Transformer } from 'unified';
import { isHastElement } from './isHastElement.mjs';

const rehypeWrap = (): Transformer<Root> => (tree, _file) => {
  for (const child of tree.children) {
    if (isHastElement(child, 'div', ['math-display'])) {
      tree.children.splice(tree.children.indexOf(child), 1, {
        type: 'element',
        tagName: 'figure',
        properties: { 'data-lang': 'math' },
        children: child.children,
        position: child.position,
      });
    }
  }
  return tree;
};

export default rehypeWrap;
