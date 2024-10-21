import * as assert from "node:assert/strict";
import { test } from "node:test";
import { memoize } from "./memoize.ts";

test("memoize", () => {
	let runCount = 0;
	const fn = (a: number, b: number) => {
		runCount += 1;
		return [a + b];
	};
	const memoized = memoize(fn);
	const result1 = memoized(1, 2);
	const result2 = memoized(1, 2);
	assert.equal(result1, result2);
	assert.equal(runCount, 1);
	fn(1, 2);
	assert.equal(runCount, 2);
});
