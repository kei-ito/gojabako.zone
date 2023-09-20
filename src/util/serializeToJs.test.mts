import * as assert from 'node:assert';
import { test } from 'node:test';
import { serializeToJs } from './serializeToJs.mts';

const s = (...args: Parameters<typeof serializeToJs>) => {
  let result = '';
  for (const chunk of serializeToJs(...args)) {
    result += chunk;
  }
  return result;
};

test('string', () => {
  assert.strictEqual(s(''), "''");
  assert.strictEqual(s('abc'), "'abc'");
  assert.strictEqual(s("abc'd"), "'abc\\'d'");
});

test('number', () => {
  assert.strictEqual(s(1), '1');
  assert.strictEqual(s(1.234), '1.234');
  assert.throws(() => s(NaN));
  assert.strictEqual(s(Infinity), 'Infinity');
  assert.strictEqual(s(-Infinity), '-Infinity');
});

test('misc', () => {
  assert.strictEqual(s(undefined), 'undefined');
  assert.strictEqual(s(null), 'null');
  assert.strictEqual(s(false), 'false');
  assert.strictEqual(s(true), 'true');
});

test('array', () => {
  assert.strictEqual(s([]), '[]');
  assert.strictEqual(s([1, '2']), "[\n  1,\n  '2',\n]");
  assert.strictEqual(s([1, '2'], 1), "[\n    1,\n    '2',\n  ]");
});

test('object', () => {
  assert.strictEqual(s({}), '{}');
  assert.strictEqual(s({ a: 1, b: '2' }), "{\n  a: 1,\n  b: '2',\n}");
  assert.strictEqual(
    s({ a: 1, b: '2' }, 2),
    "{\n      a: 1,\n      b: '2',\n    }",
  );
});

test('nested', () => {
  assert.strictEqual(
    s({ a: 1, b: ['2'], c: { d: { e: 3 } } }),
    "{\n  a: 1,\n  b: [\n    '2',\n  ],\n  c: {\n    d: {\n      e: 3,\n    },\n  },\n}",
  );
});

test('recursive', () => {
  const a = { b: { c: {} } };
  a.b.c = a;
  assert.throws(() => s(a));
});
