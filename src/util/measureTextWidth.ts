import { listCodePoints } from "@nlib/typing";

const widths = new Map<number, number>([
	[65, 12.26],
	[66, 11.54],
	[67, 12.26],
	[68, 12.34],
	[69, 10.48],
	[70, 9.82],
	[71, 12.22],
	[72, 12.67],
	[73, 4.18],
	[74, 8.51],
	[75, 11.65],
	[76, 9.81],
	[77, 15.31],
	[78, 12.56],
	[79, 12.91],
	[80, 10.82],
	[81, 12.91],
	[82, 11.81],
	[83, 10.91],
	[84, 10.62],
	[85, 12.62],
	[86, 11.78],
	[87, 16.34],
	[88, 11.95],
	[89, 11.33],
	[90, 10.86],
	[97, 9.47],
	[98, 10.61],
	[99, 9.46],
	[100, 10.61],
	[101, 9.63],
	[102, 6.13],
	[103, 10.45],
	[104, 10.13],
	[105, 3.97],
	[106, 4.42],
	[107, 9.54],
	[108, 3.89],
	[109, 15.26],
	[110, 10.14],
	[111, 10.21],
	[112, 10.62],
	[113, 10.62],
	[114, 7.15],
	[115, 8.85],
	[116, 6.48],
	[117, 10.14],
	[118, 8.98],
	[119, 14.19],
	[120, 8.94],
	[121, 9.18],
	[122, 8.16],
	[48, 10.77],
	[49, 10.77],
	[50, 10.77],
	[51, 10.77],
	[52, 10.8],
	[53, 10.77],
	[54, 10.77],
	[55, 10.77],
	[56, 10.77],
	[57, 10.77],
	[32, 5.33],
	[43, 10.62],
	[47, 7.79],
	[58, 4.0],
	[46, 4.0],
	[44, 4.0],
	[91, 5.81],
	[93, 5.81],
	[123, 5.84],
	[125, 5.84],
	[45, 5.97],
	[33, 5.12],
	[34, 5.94],
	[35, 10.8],
	[36, 10.69],
	[37, 14.32],
	[38, 13.04],
	[39, 3.23],
	[40, 5.92],
	[41, 5.92],
	[32, 5.33],
]);
const CJKWidth = 16;

export const measureTextWidth = (text: string) => {
	let width = 0;
	for (const cp of listCodePoints(text)) {
		let w = widths.get(cp) ?? 0;
		if (w === 0) {
			if (cp < 0x80) {
				w = 7;
			} else {
				w = CJKWidth;
			}
		}
		width += w;
	}
	return width;
};

export const listLines = function* (
	phrases: Iterable<string>,
	maxWidth: number,
	fontScale = 1,
) {
	let totalWidth = 0;
	let line = "";
	for (const phrase of phrases) {
		const width = measureTextWidth(phrase) * fontScale;
		if (maxWidth < totalWidth + width) {
			yield line;
			line = "";
			totalWidth = 0;
		}
		line += phrase;
		totalWidth += width;
	}
	if (line) {
		yield line;
	}
};
