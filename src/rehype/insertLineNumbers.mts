import type { Element, Text } from 'hast';
import { createRehypeElement } from './createRehypeElement.mts';

export const insertLineNumbers = (node: Element, codeId: string) => {
  let lineNumber = 0;
  const elements: Array<Element> = [];
  for (const line of listCodeLines(node)) {
    const id = `${codeId}L${++lineNumber}`;
    elements.push(
      createRehypeElement(
        'a',
        { href: `#${id}`, className: ['hljs-ln'], draggable: 'false' },
        createRehypeElement('span', { id, dataLineFocus: true }),
        createRehypeElement('span', {}, `${lineNumber}`),
      ),
      createRehypeElement('span', {}, ...line),
    );
  }
  node.children = elements;
};

const listCodeLines = function* (node: Element) {
  let buffer: Array<Element | Text> = [];
  for (const child of node.children) {
    if (child.type === 'text') {
      const lines = child.value.split('\n');
      while (0 < lines.length) {
        const value = lines.shift();
        if (value) {
          buffer.push({ type: 'text', value });
        }
        if (0 < lines.length) {
          yield buffer;
          buffer = [];
        }
      }
    } else if (child.type === 'element') {
      buffer.push(child);
    }
  }
  if (0 < buffer.length) {
    yield buffer;
  }
};
