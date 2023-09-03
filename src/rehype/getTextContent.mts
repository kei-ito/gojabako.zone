import type { ElementContent } from 'hast';

export const getTextContent = (node: {
  children: Iterable<ElementContent>;
}) => {
  let result = '';
  for (const child of node.children) {
    if (child.type === 'text') {
      result += child.value;
    }
  }
  return result;
};
