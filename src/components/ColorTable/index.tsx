import type { CSSProperties, HTMLAttributes } from "react";
import { classnames } from "../../util/classnames.ts";
import * as style from "./style.module.scss";

type ColorFn = (a: number, b: number, c: number) => [string, string];

interface ColorTableProps extends HTMLAttributes<HTMLElement> {
	fn: ColorFn;
	n?: number;
	m?: number;
}

export const ColorTable = ({
	fn,
	n = 2,
	m = 12,
	...props
}: ColorTableProps) => (
	<div {...props} className={classnames(style.table, props.className)}>
		{[...listColors(fn, n, m)]}
	</div>
);

interface Item {
	url: string;
	fn: ColorFn;
}

export const hsl: Item = {
	url: "https://developer.mozilla.org/docs/Web/CSS/color_value/hsl",
	fn: (a, b, c) => {
		const p = (20 + 70 * a).toFixed(0);
		const q = (20 + 60 * b).toFixed(0);
		const t = `${Math.round(c * 360)} ${p}% ${q}%`;
		return [t, `hsl(${t})`];
	},
};

export const hwb: Item = {
	url: "https://developer.mozilla.org/docs/Web/CSS/color_value/hwb",
	fn: (a, b, c) => {
		const p = (10 + 50 * b).toFixed(0);
		const q = (10 + 40 * a).toFixed(0);
		const t = `${Math.round(c * 360)} ${p}% ${q}%`;
		return [t, `hwb(${t})`];
	},
};

export const lch: Item = {
	url: "https://developer.mozilla.org/docs/Web/CSS/color_value/lch",
	fn: (a, b, c) => {
		const p = (30 + 60 * a).toFixed(0);
		const q = (10 + 80 * b).toFixed(0);
		const t = `${p}% ${q} ${Math.round(c * 360)}`;
		return [t, `lch(${t})`];
	},
};

export const oklch: Item = {
	url: "https://developer.mozilla.org/docs/Web/CSS/color_value/oklch",
	fn: (a, b, c) => {
		const p = (30 + 60 * a).toFixed(0);
		const q = (0.1 + 0.3 * b).toFixed(2);
		const t = `${p}% ${q} ${Math.round(c * 360)}`;
		return [t, `oklch(${t})`];
	},
};

const round = (ratio: number, r: number, precision: number) => {
	const { sign, abs } = Math;
	const t = 2 * Math.PI * ratio;
	const c = Math.cos(t);
	const s = Math.sin(t);
	const ss = 0.5;
	return [
		(r * (c + ss * sign(c) * abs(c) * s * s)).toFixed(precision),
		(r * (s + ss * sign(s) * abs(s) * c * c)).toFixed(precision),
	] as const;
};

export const lab: Item = {
	url: "https://developer.mozilla.org/docs/Web/CSS/color_value/lab",
	fn: (a, b, c) => {
		const [x, y] = round(c, 100 * (0.3 + 0.6 * b), 0);
		const t = `${(100 * (0.3 + 0.6 * a)).toFixed(0)}% ${x} ${y}`;
		return [t, `lab(${t})`];
	},
};

export const oklab: Item = {
	url: "https://developer.mozilla.org/docs/Web/CSS/color_value/oklab",
	fn: (a, b, c) => {
		const [x, y] = round(c, 0.5 * (0.3 + 0.6 * b), 2);
		const t = `${(100 * (0.3 + 0.6 * a)).toFixed(0)}% ${x} ${y}`;
		return [t, `oklab(${t})`];
	},
};

const listColors = function* (color: ColorFn, n: number, m: number) {
	for (let a = 0; a <= n; a++) {
		for (let b = 0; b <= n; b++) {
			for (let i = 0; i < m; i++) {
				const [t, c] = color(a / n, b / n, i / m);
				const cellStyle = { "--gjColor": c };
				yield (
					<div
						title={c}
						key={`${a} ${b} ${i}`}
						style={cellStyle as CSSProperties}
					>
						{t}
					</div>
				);
			}
		}
	}
};
