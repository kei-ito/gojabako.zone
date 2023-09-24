import * as assert from 'node:assert';
import { describe, test } from 'node:test';
import { serializeFileSize } from './serializeFileSize.mts';

describe(serializeFileSize.name, () => {
  const cases: Array<[number, string]> = [
    [0, '0 B'],
    [1, '1 B'],
    [999, '999 B'],
    [1000, '1.0 KB'],
    [999000, '999 KB'],
    [1000000, '1.0 MB'],
    [999000000, '999 MB'],
    [1000000000, '1.0 GB'],
  ];

  for (const [input, expected] of cases) {
    test(`${input} => ${expected}`, () => {
      const actual = serializeFileSize(input);
      assert.strictEqual(actual, expected);
    });
  }
});
