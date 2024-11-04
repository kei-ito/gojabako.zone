import * as assert from "node:assert";
import { describe, test } from "node:test";
import { decodeCellList, encodeCellList } from "./cellList.ts";

describe("cellList", () => {
	const cases: Array<Array<[number, number]>> = [
		[],
		[
			[0, 0],
			[1, 0],
		],
		[
			[0, 0],
			[0, 1],
		],
		[
			[0, 0],
			[1, 0],
			[0, 1],
		],
	];
	const sortFn = (a: [number, number], b: [number, number]) => {
		if (a[0] === b[0]) {
			return a[1] - b[1];
		}
		return a[0] - b[0];
	};
	for (const input of cases) {
		test(`encode / decode ${JSON.stringify(input)}`, () => {
			const encoded = encodeCellList(input);
			const decoded = [...decodeCellList(encoded)];
			assert.deepStrictEqual(decoded.sort(sortFn), input.sort(sortFn));
		});
	}
});
