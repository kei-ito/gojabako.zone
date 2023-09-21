import * as assert from 'node:assert';
import { test, describe } from 'node:test';
import type { Range } from './range.mts';
import {
  listValues,
  normalizeRanges,
  parseRangeListString,
  toRangeListString,
} from './range.mts';

describe(parseRangeListString.name, () => {
  const cases: Array<[string, ...Array<Range>]> = [
    ['1', [1, 1]],
    ['1,2,3', [1, 1], [2, 2], [3, 3]],
    ['1,2 ,3', [1, 1], [2, 2]],
    ['2-5', [2, 5]],
    ['5-2', [2, 5]],
    ['1,3-6,12-3', [1, 1], [3, 6], [3, 12]],
  ];
  for (const [input, ...expected] of cases) {
    test(input, () => {
      const actual = [...parseRangeListString(input)];
      assert.deepStrictEqual(actual, expected);
    });
  }
});

describe(normalizeRanges.name, () => {
  const cases: Array<{ input: Iterable<Range>; expected: Array<Range> }> = [
    { input: [[1, 1]], expected: [[1, 1]] },
    {
      input: [
        [1, 1],
        [2, 2],
      ],
      expected: [[1, 2]],
    },
    {
      input: [
        [1, 2],
        [2, 3],
      ],
      expected: [[1, 3]],
    },
    {
      input: [
        [1, 3],
        [2, 4],
      ],
      expected: [[1, 4]],
    },
    {
      input: [
        [1, 4],
        [2, 3],
      ],
      expected: [[1, 4]],
    },
    {
      input: [
        [1, 3],
        [2, 4],
        [5, 6],
      ],
      expected: [[1, 6]],
    },
    {
      input: [
        [7, 8],
        [1, 3],
        [2, 4],
      ],
      expected: [
        [1, 4],
        [7, 8],
      ],
    },
  ];
  for (const { input, expected } of cases) {
    test(JSON.stringify(input).slice(1, -1), () => {
      const actual = [...normalizeRanges(input)];
      assert.deepStrictEqual(actual, expected);
    });
  }
});

describe(toRangeListString.name, () => {
  const cases: Array<{ input: Iterable<Range>; expected: string }> = [
    { input: [[1, 1]], expected: '1' },
    { input: [[1, 2]], expected: '1-2' },
    {
      input: [
        [1, 2],
        [3, 4],
      ],
      expected: '1-2,3-4',
    },
    {
      input: [
        [1, 5],
        [2, 2],
        [8, 8],
      ],
      expected: '1-5,2,8',
    },
  ];
  for (const { input, expected } of cases) {
    test(`${JSON.stringify(input).slice(1, -1)} → ${expected}`, () => {
      const actual = toRangeListString(input);
      assert.strictEqual(actual, expected);
    });
  }
});

describe(listValues.name, () => {
  const cases: Array<{ input: Iterable<Range>; expected: Array<number> }> = [
    { input: [[1, 1]], expected: [1] },
    { input: [[1, 2]], expected: [1, 2] },
    {
      input: [
        [1, 3],
        [5, 7],
      ],
      expected: [1, 2, 3, 5, 6, 7],
    },
  ];
  for (const { input, expected } of cases) {
    test(`${JSON.stringify(input).slice(1, -1)} → ${expected.join(
      ',',
    )}`, () => {
      const actual = [...listValues(input)];
      assert.deepStrictEqual(actual, expected);
    });
  }
});
