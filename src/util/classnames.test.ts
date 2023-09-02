import { describe, test } from 'node:test';
import * as assert from 'node:assert';
import { classnames } from './classnames';

describe(classnames.name, () => {
  test('returns a string for className', () => {
    assert.equal(
      classnames('c1   c2 ', [' c3  c4', null, false, ' c5'], undefined),
      'c1 c2 c3 c4 c5',
    );
  });
});
