import * as assert from 'node:assert';
import { test } from 'node:test';
import { parse as parseScss } from 'postcss-scss';
import parseSelector from 'postcss-selector-parser';
import {
  listSelectors,
  listLocalNamesInSelector,
  listLocalNames,
} from './generateCssModuleType.mts';

{
  const cases: Array<[string, ...Array<string>]> = [
    [
      `
      .a {
        &.b :global .c.d {}
        :global(.e.f) .g {}
        :global {
          .h :local .i {}
          .j :local(.k) .l {}
        }
      }`,
      '.a',
      '.a.b :global .c.d',
      '.a :global(.e.f) .g',
      '.a :global',
      '.a :global .h :local .i',
      '.a :global .j :local(.k) .l',
    ],
  ];
  for (const [input, ...expected] of cases) {
    test(`${listSelectors.name} ${input}`, () => {
      const root = parseScss(input);
      const actual = [...listSelectors(root)];
      assert.deepStrictEqual(actual, expected);
    });
  }
}

{
  const cases: Array<[string, ...Array<string>]> = [
    [
      /**  https://github.com/css-modules/css-modules#exceptions */
      '.localA :global .global-b .global-c :local(.localD.localE) .global-d',
      'localA',
      'localD',
      'localE',
    ],
    ['.a :global .b, .c', 'a', 'c'],
    [
      '.a :global .b :local(.c.d) .e, .f :global(.g.h) .i',
      'a',
      'c',
      'd',
      'f',
      'i',
    ],
  ];
  for (const [input, ...expected] of cases) {
    test(`${listLocalNamesInSelector.name} ${input}`, () => {
      const root = parseSelector().astSync(input, { lossless: false });
      const actual = [...listLocalNamesInSelector(root, true)];
      assert.deepStrictEqual(actual, expected);
    });
  }
}

{
  const cases: Array<[string, ...Array<string>]> = [
    [
      `
      .a {
        &.b :global .c.d {}
        :global(.e.f) .g {}
        :global {
          .h :local .i {}
          .j :local(.k) .l {}
        }
      }`,
      'a',
      'b',
      'g',
      'i',
      'k',
    ],
  ];
  for (const [input, ...expected] of cases) {
    test(`${listLocalNames.name} ${input}`, () => {
      const root = parseScss(input);
      const actual = [...listLocalNames(root, true)];
      assert.deepStrictEqual(actual, expected);
    });
  }
}
