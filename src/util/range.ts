import { minmax } from "./minmax.ts";

export type Range = [number, number];

export const parseRangeListString = function* (
	rangeListString: string,
	delimiter = ",",
): Generator<Range> {
	let pos = 0;
	for (const {
		0: { length },
		1: a,
		2: b,
		index,
	} of rangeListString.matchAll(/(\d+)(?:-(\d+))?/g)) {
		const d = rangeListString.slice(pos, index);
		if (d && d !== delimiter) {
			break;
		}
		yield minmax([Number.parseInt(a, 10), Number.parseInt(b, 10)]);
		pos = index + length;
	}
};

export const normalizeRanges = function* (
	ranges: Iterable<Range>,
): Generator<Range> {
	const sorted = [...ranges].sort(([p], [q]) => p - q);
	const first = sorted.shift();
	if (!first) {
		return;
	}
	let [min, max] = first;
	for (const [a, b] of sorted) {
		if (max + 1 < a) {
			yield [min, max];
			min = a;
			max = b;
		} else if (max < b) {
			max = b;
		}
	}
	yield [min, max];
};

export const toRangeListString = (
	normalizedRanges: Iterable<Range>,
): string => {
	let result = "";
	for (const [a, b] of normalizedRanges) {
		if (result) {
			result += ",";
		}
		result += a === b ? a : `${a}-${b}`;
	}
	return result;
};

export const listValues = function* (
	normalizedRanges: Iterable<Range>,
): Generator<number> {
	for (const [a, b] of normalizedRanges) {
		for (let i = a; i <= b; i++) {
			yield i;
		}
	}
};

export const isInRange = (
	normalizedRanges: Iterable<Range>,
	value: number,
): boolean => {
	for (const [a, b] of normalizedRanges) {
		if (a <= value && value <= b) {
			return true;
		}
	}
	return false;
};
