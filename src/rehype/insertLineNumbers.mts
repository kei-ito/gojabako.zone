import type { Element, Text } from 'hast';
import { createHastElement } from './createHastElement.mts';

export const insertLineNumbers = (node: Element, codeId: string) => {
  let lineNumber = 0;
  const elements: Array<Element> = [];
  for (const line of listCodeLines(node)) {
    const id = `${codeId}L${++lineNumber}`;
    elements.push(
      createHastElement(
        'a',
        { href: `#${id}`, className: ['hljs-ln'], draggable: 'false' },
        createHastElement('span', { id, className: ['fragment-target'] }),
        createHastElement('span', {}, `${lineNumber}`),
      ),
      createHastElement('span', {}, ...line),
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
