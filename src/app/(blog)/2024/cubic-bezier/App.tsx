"use client";
import type { Nominal } from "@nlib/typing";
import {
	type CSSProperties,
	type Dispatch,
	type PropsWithChildren,
	type ChangeEvent as ReactChangeEvent,
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactNode,
	type PointerEvent as ReactPointerEvent,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";
import { LogSlider } from "../../../../components/LogSlider";
import { useIsInView } from "../../../../components/use/IsInView";
import { useRect } from "../../../../components/use/Rect";
import { clamp } from "../../../../util/clamp";
import { classnames } from "../../../../util/classnames";
import { noop } from "../../../../util/noop";
import * as style from "./style.module.scss";

type Point = Nominal<[number, number], "Point">;
const toPoint = (x: number, y: number): Point => [x, y] as Point;

const getCubicBezierFunction =
	([x0, y0]: Point, [x1, y1]: Point, [x2, y2]: Point, [x3, y3]: Point) =>
	(t1: number): Point => {
		const t2 = t1 ** 2;
		const t3 = t1 ** 3;
		const u1 = 1 - t1;
		const u2 = u1 ** 2;
		const u3 = u1 ** 3;
		return toPoint(
			u3 * x0 + 3 * u2 * t1 * x1 + 3 * u1 * t2 * x2 + t3 * x3,
			u3 * y0 + 3 * u2 * t1 * y1 + 3 * u1 * t2 * y2 + t3 * y3,
		);
	};

const getTimingFunction = (
	p0: Point,
	p1: Point,
	p2: Point,
	p3: Point,
	sampleCount: number,
) => {
	const table: Array<Point> = [
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
	return Object.assign(
		(x: number): number => {
			if (x <= p0[0]) {
				return p0[1];
			}
			if (p3[0] <= x) {
				return p3[1];
			}
			const index = table.findIndex((point) => x < point[0]);
			if (!(0 < index)) {
				throw new Error(`Invalid x: ${x}`);
			}
			const [x1, y1] = table[index - 1];
			const [x2, y2] = table[index];
			const r = (x - x1) / (x2 - x1);
			return y1 * (1 - r) + y2 * r;
		},
		{ table },
	);
};

type Vector = Nominal<[number, number], "Vector">;
const toVector = (x: number, y: number): Vector => [x, y] as Vector;
interface ViewBox {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}
type Point4 = [Point, Point, Point, Point];
type Vector4 = [Vector, Vector, Vector, Vector];

interface Context {
	viewBox: ViewBox;
	points: Point4;
	moves: Vector4;
	pxScale: number;
	t: number;
	u: number;
	isInView: boolean;
	noControl: boolean;
}
type ControlPointIndex = 0 | 1 | 2 | 3;

const getDiffLimits = (viewBox: ViewBox, point: Point, pxScale: number) => {
	const minX = (viewBox.minX - point[0]) / pxScale;
	const maxX = (viewBox.maxX - point[0]) / pxScale;
	const minY = (viewBox.minY - point[1]) / pxScale;
	const maxY = (viewBox.maxY - point[1]) / pxScale;
	return { minX, maxX, minY, maxY };
};
const r = (value: number, digits = 2) =>
	value.toFixed(digits).replace(/\.?0+$/, "");
interface ApplyMoveAction {
	type: "applyMove";
	index: ControlPointIndex;
	d: Vector;
}
interface SetMoveAction {
	type: "setMove";
	index: ControlPointIndex;
	d: Vector;
}
interface SetScaleAction {
	type: "setScale";
	pxScale: number;
}
interface SetTAction {
	type: "setT";
	t: number;
}
interface SetUAction {
	type: "setU";
	u: number;
}
interface SetIsInViewAction {
	type: "setIsInView";
	isInView: boolean;
}
type Action =
	| ApplyMoveAction
	| SetMoveAction
	| SetScaleAction
	| SetTAction
	| SetUAction
	| SetIsInViewAction;
const reducer = (current: Context, action: Action): Context => {
	switch (action.type) {
		case "applyMove": {
			const { index, d } = action;
			const moves = current.moves.slice() as Vector4;
			moves[index] = toVector(0, 0);
			const points = current.points.slice() as Point4;
			const point = points[index];
			const { viewBox, pxScale } = current;
			const limits = getDiffLimits(viewBox, points[index], pxScale);
			const move = toVector(
				clamp(d[0], limits.minX, limits.maxX),
				clamp(d[1], limits.minY, limits.maxY),
			);
			points[index] = toPoint(
				point[0] + move[0] * pxScale,
				point[1] + move[1] * pxScale,
			);
			return { ...current, moves, points };
		}
		case "setMove": {
			const moves = current.moves.slice() as Vector4;
			const { index, d } = action;
			const { viewBox, points, pxScale } = current;
			const limits = getDiffLimits(viewBox, points[index], pxScale);
			moves[index] = toVector(
				clamp(d[0], limits.minX, limits.maxX),
				clamp(d[1], limits.minY, limits.maxY),
			);
			return { ...current, moves };
		}
		case "setScale":
			return { ...current, pxScale: action.pxScale };
		case "setT":
			return { ...current, t: action.t };
		case "setU":
			return { ...current, u: action.u };
		case "setIsInView":
			return { ...current, isInView: action.isInView };
		default:
			return current;
	}
};
const context1: Context = {
	viewBox: { minX: -60, maxX: 60, minY: -30, maxY: 30 },
	points: [toPoint(-45, 0), toPoint(-20, -20), toPoint(10, 20), toPoint(45, 0)],
	moves: [toVector(0, 0), toVector(0, 0), toVector(0, 0), toVector(0, 0)],
	pxScale: 0,
	t: 0.4,
	u: 0,
	isInView: false,
	noControl: false,
};
const Context = createContext(context1);
const DispatchContext = createContext<Dispatch<Action>>(noop);

interface AppProps {
	initialContext: Context;
	title: ReactNode;
	footer: ReactNode;
}

const App = ({
	initialContext,
	title,
	children,
	footer,
}: PropsWithChildren<AppProps>) => {
	const [svg, setSvg] = useState<SVGSVGElement | null>();
	const rect = useRect(svg);
	const [context, dispatch] = useReducer(reducer, initialContext);
	const { minX, maxX, minY, maxY } = context.viewBox;
	const viewBoxWidth = maxX - minX;
	const viewBoxHeight = maxY - minY;
	const pxScale = rect ? viewBoxWidth / rect.width : 0;
	const [isInViewCount, setIsInViewCount] = useState(0);
	const isInView = useIsInView(svg);
	useEffect(() => {
		if (rect) {
			dispatch({ type: "setScale", pxScale });
		}
	}, [rect, pxScale]);
	useEffect(() => {
		dispatch({ type: "setIsInView", isInView });
		if (isInView) {
			setIsInViewCount((count) => count + 1);
		}
	}, [isInView]);
	const svgStyle = { "--gjPx": `${r(pxScale)}px` } as CSSProperties;
	return (
		<div className={style.app}>
			<DispatchContext.Provider value={dispatch}>
				<Context.Provider value={context}>
					<svg
						viewBox={`${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`}
						className={classnames(
							style.svg,
							!context.noControl && style.hasControl,
						)}
						style={svgStyle}
						ref={setSvg}
					>
						<title>{title}</title>
						{0 < isInViewCount && children}
					</svg>
					<div className={style.spacer} />
					{footer}
				</Context.Provider>
			</DispatchContext.Provider>
		</div>
	);
};

export const CubicBezierApp = () => (
	<App
		initialContext={context1}
		title="cubicBezierの動作確認"
		footer={<Config1 />}
	>
		<GridAndCurves step={5} />
		<ControlPointHandle index={0} />
		<ControlPointHandle index={1} />
		<ControlPointHandle index={2} />
		<ControlPointHandle index={3} />
		<GuideAndT />
	</App>
);

const Config1 = () => {
	const dispatch = useContext(DispatchContext);
	const onChange = useCallback(
		(event: ReactChangeEvent<HTMLInputElement>) => {
			dispatch({ type: "setT", t: Number.parseFloat(event.target.value) });
		},
		[dispatch],
	);
	const { t } = useContext(Context);
	return (
		<>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				defaultValue={t}
				onChange={onChange}
			/>
			<div className="katex">
				<span className="mord mathnormal">t</span> = {t.toFixed(2)}
			</div>
		</>
	);
};

const GridAndCurves = ({ step }: { step: number }) => {
	const {
		viewBox: { minX, maxX, minY, maxY },
	} = useContext(Context);
	const [p0, p1, p2, p3] = useActualControlPoints();
	const p0x = r(p0[0]);
	const p0y = r(p0[1]);
	const p1x = r(p1[0]);
	const p1y = r(p1[1]);
	const p2x = r(p2[0]);
	const p2y = r(p2[1]);
	const p3x = r(p3[0]);
	const p3y = r(p3[1]);
	const d = `M${p0x} ${p0y}C${p1x} ${p1y} ${p2x} ${p2y} ${p3x} ${p3y}`;
	return (
		<>
			<path
				d={[
					...(function* () {
						for (let x = minX + step; x < maxX; x += step) {
							yield `M${r(x)} ${minY}V${maxY}`;
						}
						for (let y = minY + step; y < maxY; y += step) {
							yield `M${minX} ${r(y)}H${maxX}`;
						}
					})(),
				].join("")}
				className={style.grid}
			/>
			<line x1={p0x} y1={p0y} x2={p1x} y2={p1y} className={style.handleLine} />
			<line x1={p2x} y1={p2y} x2={p3x} y2={p3y} className={style.handleLine} />
			<path d={d} className={style.curve} />
		</>
	);
};

const ControlPointHandle = ({ index }: { index: ControlPointIndex }) => {
	const dispatch = useContext(DispatchContext);
	const onPointerDown = useCallback(
		(event: ReactPointerEvent<SVGCircleElement>) => {
			const { currentTarget: element, clientX: x0, clientY: y0 } = event;
			const abc = new AbortController();
			element.setPointerCapture(event.pointerId);
			element.addEventListener(
				"pointermove",
				(event: PointerEvent) => {
					const { clientX: x1, clientY: y1 } = event;
					dispatch({ type: "setMove", index, d: toVector(x1 - x0, y1 - y0) });
				},
				{ signal: abc.signal },
			);
			element.addEventListener(
				"pointerup",
				({ clientX: x1, clientY: y1 }: PointerEvent) => {
					abc.abort();
					dispatch({ type: "applyMove", index, d: toVector(x1 - x0, y1 - y0) });
				},
				{ signal: abc.signal },
			);
		},
		[index, dispatch],
	);
	const { pxScale } = useContext(Context);
	const onKeyDown = useCallback(
		(event: ReactKeyboardEvent<SVGCircleElement>) => {
			const d = toVector(0, 0);
			const amount = 1 / pxScale;
			switch (event.key) {
				case "ArrowLeft":
					d[0] = -amount;
					break;
				case "ArrowRight":
					d[0] = amount;
					break;
				case "ArrowUp":
					d[1] = -amount;
					break;
				case "ArrowDown":
					d[1] = amount;
					break;
				default:
					return;
			}
			event.preventDefault();
			dispatch({ type: "applyMove", index, d });
		},
		[index, dispatch, pxScale],
	);
	const [x, y] = useActualControlPoints()[index];
	return (
		<circle
			cx={r(x)}
			cy={r(y)}
			r={r(10 * pxScale)}
			className={style.handle}
			data-index={index}
			tabIndex={0}
			onPointerDown={onPointerDown}
			onKeyDown={onKeyDown}
		/>
	);
};

const GuideAndT = () => {
	const { t, pxScale } = useContext(Context);
	const [p0, p1, p2, p3] = useActualControlPoints();
	const cb = getCubicBezierFunction(p0, p1, p2, p3);
	return [t, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((tt, index) => {
		const p = cb(tt);
		return (
			<circle
				key={index === 0 ? "p" : tt}
				cx={r(p[0])}
				cy={r(p[1])}
				r={r((index === 0 ? 6 : 3) * pxScale)}
				className={index === 0 ? style.point : style.ruler}
			/>
		);
	});
};

const context2: Context = {
	viewBox: { minX: -80, maxX: 180, minY: -40, maxY: 140 },
	points: [toPoint(0, 100), toPoint(42, 100), toPoint(58, 0), toPoint(100, 0)],
	moves: [toVector(0, 0), toVector(0, 0), toVector(0, 0), toVector(0, 0)],
	pxScale: 0,
	t: 15,
	u: 2000,
	isInView: false,
	noControl: false,
};

export const TimingFunctionApp = ({
	noControl = false,
}: { noControl?: boolean }) => (
	<App
		initialContext={{ ...context2, noControl }}
		title="cubic-bezierのサンプル"
		footer={!noControl && <Config2 />}
	>
		<rect x="0" y="0" width="100" height="100" className={style.area} />
		<GridAndCurves step={10} />
		<rect x="0" y="0" width="100" height="100" className={style.areaRect} />
		<AnimatedShapes />
		{!noControl && (
			<>
				<ControlPointHandle index={1} />
				<ControlPointHandle index={2} />
			</>
		)}
	</App>
);

const AnimatedShapes = () => {
	const { t, moves, pxScale, isInView } = useContext(Context);
	const points = useActualControlPoints();
	const cb = getTimingFunction(...points, Math.round(t));
	const p1 = points[1];
	const p2 = points[2];
	const isNotMoving = moves.every(([x, y]) => x === 0 || y === 0);
	return (
		<>
			<path
				d={cb.table
					.map(([x, y], i) => `${i === 0 ? "M" : "L"}${r(x)} ${r(y)}`)
					.join("")}
				className={style.table}
			/>
			{isNotMoving && isInView && <AnimatedPoint getY={cb} />}
			<text
				x="50"
				y="130"
				className={classnames(style.text, style.mono)}
				textAnchor="middle"
			>
				{pxScale < 0.6 ? "cubic-bezier" : ""}
				{`(${r(p1[0] / 100)},${r(p1[1] / 100)},${r(p2[0] / 100)},${r(p2[1] / 100)})`}
			</text>
		</>
	);
};

const AnimatedPoint = ({ getY }: { getY: (x: number) => number }) => {
	const { pxScale, u } = useContext(Context);
	const [x, setX] = useState(0);
	useEffect(() => {
		let frameId = requestAnimationFrame((timeStampMs) => {
			const waitMs = 200;
			const durationMs = u * 2;
			const render = (ms: number) => {
				const elapsedMs = ms - timeStampMs;
				if (waitMs < elapsedMs) {
					let phase = (2 * ((elapsedMs - waitMs) % durationMs)) / durationMs;
					if (1 < phase) {
						phase = 2 - phase;
					}
					setX(phase * 100);
				}
				frameId = requestAnimationFrame(render);
			};
			render(timeStampMs);
		});
		return () => {
			setX(0);
			cancelAnimationFrame(frameId);
		};
	}, [u]);
	const y = getY(x);
	const phase = y / 100;
	const rx = r(x);
	const ry = r(y);
	const rr = r(4 * pxScale);
	return (
		<>
			<line x1={rx} y1="0" x2={rx} y2="100" className={style.guide} />
			<line x1="0" y1={ry} x2="100" y2={ry} className={style.guide} />
			<circle cx={rx} cy="100" r={rr} className={style.point} />
			<circle cx="100" cy={ry} r={rr} className={style.point} />
			<circle cx={rx} cy={ry} r={rr} className={style.point} />
			<text
				x={rx}
				y={100 + 20 * pxScale}
				className={classnames(style.text, style.math, "katex")}
				textAnchor="middle"
			>
				<tspan className="mord mathnormal">x</tspan>
			</text>
			<text
				x={100 + 10 * pxScale}
				y={ry}
				className={classnames(style.text, style.math, "katex")}
				dominantBaseline="middle"
			>
				<tspan className="mord mathnormal">y</tspan>
			</text>
			<g className={style.animated}>
				<RotatingRect phase={phase} x={-40} y={-10} times={1} />
				<RotatingRect phase={phase} x={-40} y={30} times={4} />
				<ScalingRect phase={phase} x={-40} y={70} rx={1} ry={0} />
				<ScalingRect phase={phase} x={-40} y={110} rx={0} ry={2} />
				<ScalingCircle phase={phase} x={140} y={-10} />
				<MovingRect phase={phase} x={140} y={30} dx={30} dy={0} />
				<MovingRect phase={phase} x={140} y={95} dx={0} dy={90} />
			</g>
		</>
	);
};

const RotatingRect = ({
	x,
	y,
	times,
	phase,
}: { x: number; y: number; times: number; phase: number }) => {
	const width = 20;
	const height = 10;
	const radius = 3;
	return (
		<rect
			x={x - width / 2}
			y={y - height / 2}
			width={width}
			height={height}
			rx={radius}
			ry={radius}
			transform={`rotate(${r(phase * 360 * times)} ${r(x)} ${r(y)})`}
		/>
	);
};

const ScalingRect = ({
	x,
	y,
	rx,
	ry,
	phase,
}: { x: number; y: number; rx: number; ry: number; phase: number }) => {
	const width = 20 * (1 + phase * rx);
	const height = 10 * (1 + phase * ry);
	const radius = 3;
	return (
		<rect
			x={x - width / 2}
			y={y - height / 2}
			width={width}
			height={height}
			rx={radius}
			ry={radius}
		/>
	);
};

const ScalingCircle = ({
	x,
	y,
	phase,
}: { x: number; y: number; phase: number }) => {
	return <circle cx={x} cy={y} r={10 * (0.5 + phase)} />;
};

const MovingRect = ({
	x,
	y,
	dx,
	dy,
	phase,
}: { x: number; y: number; dx: number; dy: number; phase: number }) => {
	const width = 20;
	const height = 10;
	const radius = 3;
	return (
		<rect
			x={x - width / 2 + dx * (phase - 0.5)}
			y={y - height / 2 + dy * (phase - 0.5)}
			width={width}
			height={height}
			rx={radius}
			ry={radius}
		/>
	);
};

const Config2 = () => {
	const dispatch = useContext(DispatchContext);
	const onChangeT = useCallback(
		(t: number) => dispatch({ type: "setT", t }),
		[dispatch],
	);
	const onChangeU = useCallback(
		(u: number) => dispatch({ type: "setU", u }),
		[dispatch],
	);
	const { t, u } = useContext(Context);
	return (
		<>
			<LogSlider
				min={200}
				max={5000}
				defaultValue={u}
				onChangeValue={onChangeU}
			/>
			<div className="katex">
				<span className="mord mathnormal">T</span> = {u.toFixed(0)} ms
			</div>
			<LogSlider min={2} max={50} defaultValue={t} onChangeValue={onChangeT} />
			<div className="katex">
				<span className="mord mathnormal">N</span> = {t.toFixed(0)}
			</div>
		</>
	);
};

const useActualControlPoints = (): Point4 => {
	const { points, moves, pxScale } = useContext(Context);
	return points.map(([x, y], index) => {
		const move = moves[index];
		return toPoint(x + move[0] * pxScale, y + move[1] * pxScale);
	}) as Point4;
};
