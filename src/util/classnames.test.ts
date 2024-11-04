import * as assert from "node:assert";
import { describe, test } from "node:test";
import { classnames } from "./classnames.ts";

describe("classnames", () => {
	const cases: Array<[Parameters<typeof classnames>, string]> = [
		[[""], ""],
		[["c1"], "c1"],
		[["c1 c2"], "c1 c2"],
		[["c1 c2 c1"], "c1 c2"],
		[["c1 c2", "c3"], "c1 c2 c3"],
		[["c1 c2", ["c3", undefined, null, false]], "c1 c2 c3"],
		[["c1 c2", ["c3", undefined, null, false, ["c1 c2", "c4"]]], "c1 c2 c3 c4"],
	];
	for (const [args, expected] of cases) {
		test(`${JSON.stringify(args).slice(1, -1)} → ${expected}`, () => {
			assert.strictEqual(classnames(...args), expected);
		});
	}
});
