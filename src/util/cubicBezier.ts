type Point = [number, number];

const getCubicBezierFunction =
	([x0, y0]: Point, [x1, y1]: Point, [x2, y2]: Point, [x3, y3]: Point) =>
	(t1: number): Point => {
		const t2 = t1 ** 2;
		const t3 = t1 ** 3;
		const u1 = 1 - t1;
		const u2 = u1 ** 2;
		const u3 = u1 ** 3;
		return [
			u3 * x0 + 3 * u2 * t1 * x1 + 3 * u1 * t2 * x2 + t3 * x3,
			u3 * y0 + 3 * u2 * t1 * y1 + 3 * u1 * t2 * y2 + t3 * y3,
		];
	};

export const getTimingFunction = (p1: Point, p2: Point, sampleCount = 20) => {
	const p0: Point = [0, 0];
	const p3: Point = [1, 1];
	const samples: Array<Point> = [
		p0,
		...(function* () {
			const cb = getCubicBezierFunction(p0, p1, p2, p3);
			const step = 1 / sampleCount;
			for (let t = step; t < 1; t += step) {
				yield cb(t);
			}
		})(),
		p3,
	];
	return (x: number): number => {
		if (x <= p0[0]) {
			return p0[1];
		}
		if (p3[0] <= x) {
			return p3[1];
		}
		const index = samples.findIndex((point) => x < point[0]);
		if (!(0 < index)) {
			throw new Error(`Invalid x: ${x}`);
		}
		const [x1, y1] = samples[index - 1];
		const [x2, y2] = samples[index];
		const r = (x - x1) / (x2 - x1);
		return y1 * (1 - r) + y2 * r;
	};
};

export const ease = getTimingFunction([0.25, 0.1], [0.25, 1]);
export const easeIn = getTimingFunction([0.42, 0], [1, 1]);
export const easeOut = getTimingFunction([0, 0], [0.58, 1]);
export const easeInOut = getTimingFunction([0.42, 0], [0.58, 1]);
