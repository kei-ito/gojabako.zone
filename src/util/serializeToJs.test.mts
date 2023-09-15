import * as assert from 'node:assert';
import { test } from 'node:test';
import { serializeToJs } from './serializeToJs.mjs';

const s = (...args: Parameters<typeof serializeToJs>) => {
  let result = '';
  for (const chunk of serializeToJs(...args)) {
    result += chunk;
  }
  return result;
};

test('string', () => {
  assert.equal(s(''), "''");
  assert.equal(s('abc'), "'abc'");
  assert.equal(s("abc'd"), "'abc\\'d'");
});

test('number', () => {
  assert.equal(s(1), '1');
  assert.equal(s(1.234), '1.234');
  assert.throws(() => s(NaN));
  assert.equal(s(Infinity), 'Infinity');
  assert.equal(s(-Infinity), '-Infinity');
});

test('misc', () => {
  assert.equal(s(undefined), 'undefined');
  assert.equal(s(null), 'null');
  assert.equal(s(false), 'false');
  assert.equal(s(true), 'true');
});

test('array', () => {
  assert.equal(s([]), '[]');
  assert.equal(s([1, '2']), "[\n  1,\n  '2',\n]");
  assert.equal(s([1, '2'], 1), "[\n    1,\n    '2',\n  ]");
});

test('object', () => {
  assert.equal(s({}), '{}');
  assert.equal(s({ a: 1, b: '2' }), "{\n  a: 1,\n  b: '2',\n}");
  assert.equal(s({ a: 1, b: '2' }, 2), "{\n      a: 1,\n      b: '2',\n    }");
});

test('nested', () => {
  assert.equal(
    s({ a: 1, b: ['2'], c: { d: { e: 3 } } }),
    "{\n  a: 1,\n  b: [\n    '2',\n  ],\n  c: {\n    d: {\n      e: 3,\n    },\n  },\n}",
  );
});

test('recursive', () => {
  const a = { b: { c: {} } };
  a.b.c = a;
  assert.throws(() => s(a));
});
