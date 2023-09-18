import {
  entries,
  isArray,
  isBoolean,
  isFiniteNumber,
  isObject,
  isString,
} from '@nlib/typing';

const escapeQuotes = (input: string): string => input.replace(/'/g, "\\'");
const appendAncestor = (
  ancestors: Array<object>,
  item: object,
): Array<object> => {
  if (ancestors.includes(item)) {
    throw new Error('Recursive');
  }
  return [...ancestors, item];
};
// eslint-disable-next-line max-lines-per-function
const serialize = function* (
  input: unknown,
  indentDepth: number,
  indent: string,
  ancestors: Array<object>,
): Generator<string> {
  if (isString(input)) {
    yield `'${escapeQuotes(input)}'`;
  } else if (isFiniteNumber(input)) {
    yield `${input}`;
  } else if (isArray(input)) {
    ancestors = appendAncestor(ancestors, input);
    if (input.length === 0) {
      yield '[]';
      return;
    }
    yield '[\n';
    for (const item of input) {
      yield `${indent.repeat(indentDepth + 1)}`;
      yield* serialize(item, indentDepth + 1, indent, ancestors);
      yield ',\n';
    }
    yield `${indent.repeat(indentDepth)}]`;
  } else if (isObject(input)) {
    ancestors = appendAncestor(ancestors, input);
    const items = entries(input);
    if (items.length === 0) {
      yield '{}';
      return;
    }
    yield '{\n';
    if (items.every(([key]) => /^[^\d\s][^\s]*$/.test(key))) {
      for (const [key, value] of items) {
        yield `${indent.repeat(indentDepth + 1)}${key}: `;
        yield* serialize(value, indentDepth + 1, indent, ancestors);
        yield ',\n';
      }
    } else {
      for (const [key, value] of items) {
        yield `${indent.repeat(indentDepth + 1)}'${escapeQuotes(key)}': `;
        yield* serialize(value, indentDepth + 1, indent, ancestors);
        yield ',\n';
      }
    }
    yield `${indent.repeat(indentDepth)}}`;
  } else if (isBoolean(input)) {
    yield input ? 'true' : 'false';
  } else if (input === undefined) {
    yield 'undefined';
  } else if (input === null) {
    yield 'null';
  } else if (input === Infinity) {
    yield 'Infinity';
  } else if (input === -Infinity) {
    yield '-Infinity';
  } else {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    throw new Error(`UnsupportedType: ${input}`);
  }
};

export const serializeToJs = (
  input: unknown,
  indentDepth = 0,
  indent = '  ',
) => {
  return serialize(input, indentDepth, indent, []);
};
