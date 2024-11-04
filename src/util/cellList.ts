import { ensure, isPositiveSafeInteger } from "@nlib/typing";
import { decode, encode } from "vlq";

type Cell = [number, number];

export const encodeCellList = (cellList: Iterable<Cell>): string => {
	const cellArray = [...cellList];
	const limits = getBoundingLimits(cellArray);
	const xy = encode([...listRunLengthsXY(cellArray, limits)]);
	const yx = encode([...listRunLengthsYX(cellArray, limits)]);
	const w = 1 + limits[2] - limits[0];
	const h = 1 + limits[3] - limits[1];
	return xy.length < yx.length ? `${w}w${h}h${xy}` : `${h}h${w}w${yx}`;
};

type Limits = [number, number, number, number];

const getBoundingLimits = (cellList: Iterable<Cell>): Limits => {
	let minX = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;
	for (const [x, y] of cellList) {
		if (x < minX) {
			minX = x;
		}
		if (maxX < x) {
			maxX = x;
		}
		if (y < minY) {
			minY = y;
		}
		if (maxY < y) {
			maxY = y;
		}
	}
	return [minX, minY, maxX, maxY];
};

const listRunLengthsXY = function* (
	cellList: Array<Cell>,
	[minX, minY, maxX, maxY]: Limits,
): Generator<number> {
	let runLength = 0;
	let lastState = true;
	for (let y = minY; y <= maxY; y++) {
		const subCellList = cellList.filter(([, cy]) => cy === y);
		for (let x = minX; x <= maxX; x++) {
			const state = subCellList.some(([cx]) => cx === x);
			if (lastState === state) {
				runLength++;
			} else {
				yield runLength;
				lastState = state;
				runLength = 1;
			}
		}
	}
};

const listRunLengthsYX = function* (
	cellList: Array<Cell>,
	[minX, minY, maxX, maxY]: Limits,
): Generator<number> {
	let runLength = 0;
	let lastState = true;
	for (let x = minX; x <= maxX; x++) {
		const subCellList = cellList.filter(([cx]) => cx === x);
		for (let y = minY; y <= maxY; y++) {
			const state = subCellList.some(([, cy]) => cy === y);
			if (lastState === state) {
				runLength++;
			} else {
				yield runLength;
				lastState = state;
				runLength = 1;
			}
		}
	}
};

export const decodeCellList = function* (encoded: string): Generator<Cell> {
	const matched = /^(\d+)([wh])(\d+)([wh])(.*)$/.exec(encoded);
	if (matched) {
		switch (`${matched[2]}${matched[4]}`) {
			case "wh":
				yield* decodeXY(
					ensure(Number(matched[1]), isPositiveSafeInteger),
					ensure(Number(matched[3]), isPositiveSafeInteger),
					matched[5],
				);
				break;
			case "hw":
				yield* decodeYX(
					ensure(Number(matched[3]), isPositiveSafeInteger),
					ensure(Number(matched[1]), isPositiveSafeInteger),
					matched[5],
				);
				break;
			default:
		}
	}
};

const decodeXY = function* (
	w: number,
	h: number,
	vlq: string,
): Generator<Cell> {
	const x = 0;
	const y = 0;
	let state = true;
	let pos = 0;
	for (const length of decode(vlq)) {
		const endPos = pos + length;
		if (state) {
			while (pos < endPos) {
				yield [x + (pos % w), y + Math.floor(pos / w)];
				pos++;
			}
		}
		pos = endPos;
		state = !state;
	}
	if (state) {
		const endPos = w * h;
		while (pos < endPos) {
			yield [x + (pos % w), y + Math.floor(pos / w)];
			pos++;
		}
	}
};

const decodeYX = function* (
	w: number,
	h: number,
	vlq: string,
): Generator<Cell> {
	const x = 0;
	const y = 0;
	let state = true;
	let pos = 0;
	for (const length of decode(vlq)) {
		const endPos = pos + length;
		if (state) {
			while (pos < endPos) {
				yield [x + Math.floor(pos / h), y + (pos % h)];
				pos++;
			}
		}
		pos = endPos;
		state = !state;
	}
	if (state) {
		const endPos = w * h;
		while (pos < endPos) {
			yield [x + Math.floor(pos / h), y + (pos % h)];
			pos++;
		}
	}
};
