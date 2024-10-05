import * as assert from "node:assert";
import { test } from "node:test";
import { classnames } from "./classnames.ts";

test("returns a string for className", () => {
	assert.strictEqual(
		classnames("c1   c2 ", [" c3  c4", null, false, " c5"], undefined),
		"c1 c2 c3 c4 c5",
	);
});
