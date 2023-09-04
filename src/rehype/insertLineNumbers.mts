import type { Element, Text } from 'hast';

export const insertLineNumbers = (node: Element, codeBlockNumber: number) => {
  let lineNumber = 0;
  const elements: Array<Element> = [];
  for (const line of listCodeLines(node)) {
    const id = `C${codeBlockNumber}L${++lineNumber}`;
    elements.push(
      {
        type: 'element',
        tagName: 'a',
        properties: { href: `#${id}`, className: ['hljs-ln'] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { id, dataLineFocus: true },
            children: [],
          },
          { type: 'text', value: `${lineNumber}` },
        ],
      },
      {
        type: 'element',
        tagName: 'span',
        properties: {},
        children: line,
      },
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
