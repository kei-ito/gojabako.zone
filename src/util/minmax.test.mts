import * as assert from 'node:assert';
import { describe, test } from 'node:test';
import { minmax } from './minmax.mts';

describe(minmax.name, () => {
  const cases: Array<{ input: Array<number>; expected: [number, number] }> = [
    { input: [], expected: [Infinity, -Infinity] },
    { input: [1], expected: [1, 1] },
    { input: [-100, 200, 3000], expected: [-100, 3000] },
    { input: [3000, 200, -100], expected: [-100, 3000] },
    { input: [3000, 200, -100, NaN], expected: [-100, 3000] },
  ];

  for (const { input, expected } of cases) {
    test(`(${input.join(', ')}) → [${expected.join(',')}]`, () => {
      assert.deepStrictEqual(minmax(input), expected);
    });
  }
});
