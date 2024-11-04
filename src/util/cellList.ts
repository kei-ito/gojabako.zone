import { isSafeInteger } from "@nlib/typing";
import { decode, encode } from "vlq";

type Cell = [number, number];

export const encodeCellList = (cellList: Iterable<Cell>): string => {
	const cellArray = [...cellList];
	const limits = getBoundingLimits(cellArray);
	const vlq = encode([...listRunLengths(cellArray, limits)]);
	return `${1 + limits[2] - limits[0]}w${1 + limits[3] - limits[1]}h${vlq}`;
};

export const decodeCellList = function* (encoded: string): Generator<Cell> {
	const matched = /^(\d+)w(\d+)h(.*)$/.exec(encoded);
	if (matched) {
		const wh: [number, number] = [0, 0];
		for (let i = 0; i < 2; i++) {
			const value = Number(matched[i + 1]);
			if (!isSafeInteger(value)) {
				return;
			}
			wh[i] = value;
		}
		const [w, h] = wh;
		const x = Math.round(w / -2);
		const y = Math.round(h / -2);
		let state = true;
		let pos = 0;
		for (const length of decode(matched[3])) {
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
		{
			const endPos = w * h;
			while (pos < endPos) {
				yield [x + (pos % w), y + Math.floor(pos / w)];
				pos++;
			}
		}
	}
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

const listRunLengths = function* (
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
