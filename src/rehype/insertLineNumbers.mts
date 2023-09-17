import type { Element, Text } from 'hast';
import { createHastElement } from './createHastElement.mts';

export const insertLineNumbers = (node: Element, codeId: string) => {
  let lineNumber = 0;
  const elements: Array<Element> = [];
  for (const line of listFragments(node)) {
    if (line !== 0) {
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
  }
  node.children = elements;
};

const listFragments = function* (
  node: Element,
): Generator<Array<Element | Text> | 0> {
  let buffer: Array<Element | Text> = [];
  const flush = function* (): Generator<Array<Element | Text>> {
    yield buffer;
    // eslint-disable-next-line require-atomic-updates
    buffer = [];
  };
  for (const child of node.children) {
    switch (child.type) {
      case 'text':
        for (const value of listLines(child.value)) {
          if (value === 0) {
            yield* flush();
            yield 0;
          } else {
            buffer.push({ type: 'text', value });
          }
        }
        break;
      case 'element':
        for (const children of listFragments(child)) {
          if (children === 0) {
            yield* flush();
            yield 0;
          } else {
            buffer.push({ ...child, children });
          }
        }
        break;
      default:
    }
  }
  if (0 < buffer.length) {
    yield* flush();
  }
};

const listLines = function* (text: string): Generator<string | 0> {
  let pos = 0;
  while (pos <= text.length) {
    if (0 < pos) {
      yield 0;
    }
    let index = text.indexOf('\n', pos);
    if (index < 0) {
      index = text.length;
    }
    if (pos < index) {
      yield text.slice(pos, index);
      pos = index + 1;
    } else {
      break;
    }
  }
};
