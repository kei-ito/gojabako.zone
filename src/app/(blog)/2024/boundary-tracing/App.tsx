"use client";
import type { ValueOf } from "@nlib/typing";
import {
	type CSSProperties,
	type ChangeEvent,
	Fragment,
	type PropsWithChildren,
	type SVGAttributes,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Select } from "../../../../components/Select";
import { useIsInView } from "../../../../components/use/IsInView";
import { useRect } from "../../../../components/use/Rect.ts";
import { clamp } from "../../../../util/clamp";
import { IconClass, classnames } from "../../../../util/classnames.ts";
import { memoize } from "../../../../util/memoize.ts";
import * as style from "./style.module.scss";

type Edge = [number, number, number, number];
type CellEdge = Edge & { x: number; y: number };
const Direction = { Right: 0, Down: 1, Left: 2, Up: 3 } as const;
type Direction = ValueOf<typeof Direction>;
type ViewBox = [number, number, number, number];
interface BoundingBox {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

const isSameEdge = (a: Edge, b: Edge) => a.every((v, i) => v === b[i]);
const getOppositeEdge = (e: Edge): Edge => [e[2], e[3], e[0], e[1]];
const getDirection = (e: Edge): Direction => {
	const dx = e[2] - e[0];
	const dy = e[3] - e[1];
	if (dx === 0) {
		if (0 < dy) {
			return Direction.Down;
		}
		if (dy < 0) {
			return Direction.Up;
		}
	} else if (dy === 0) {
		if (0 < dx) {
			return Direction.Right;
		}
		if (dx < 0) {
			return Direction.Left;
		}
	}
	throw new Error(`Invalid edge: ${e}`);
};
const r = (value: number) => value.toFixed(4).replace(/\.?0+$/, "");
const parseViewBox = function* (viewBoxString: string): Generator<number> {
	let i = 0;
	for (const part of viewBoxString.trim().split(/\s+/)) {
		yield Number.parseFloat(part);
		if (4 <= ++i) {
			break;
		}
	}
};
/** @return [min,min+u)内かつvalueからの距離がuの整数倍のところ */
const getStart = (u: number, min: number, value: number) => {
	const diff = value - min;
	const offset = diff - Math.floor(diff / u) * u;
	return min + offset + (offset < 0 ? 1 : 0);
};
const getNextDFragment = (x1: number, y1: number, x2: number, y2: number) => {
	if (x1 === x2) {
		return `V${r(y2)}`;
	}
	if (y1 === y2) {
		return `H${r(x2)}`;
	}
	return `L${r(x2)} ${r(y2)}`;
};
const getLineD = (x1: number, y1: number, x2: number, y2: number) =>
	`M${r(x1)} ${r(y1)}${getNextDFragment(x1, y1, x2, y2)}`;
const getArrowD = ([x1, y1, x2, y2]: Edge, l: number, da = Math.PI / 6) => {
	let d = getLineD(x1, y1, x2, y2);
	const t = Math.atan2(y2 - y1, x2 - x1);
	const a1 = t + da;
	d += getLineD(x2 - l * Math.cos(a1), y2 - l * Math.sin(a1), x2, y2);
	const a2 = t - da;
	d += getNextDFragment(
		x2,
		y2,
		x2 - l * Math.cos(a2),
		y2 - l * Math.sin(a2),
	).slice();
	return d;
};

const isPointInView = (bb: BoundingBox, x: number, y: number) =>
	bb.minX <= x && x <= bb.maxX && bb.minY <= y && y <= bb.maxY;
const isEdgeInView = (bb: BoundingBox, e: Edge) =>
	isPointInView(bb, e[0], e[1]) || isPointInView(bb, e[2], e[3]);

interface BoundaryTracingProps {
	/** X方向の余白 (格子座標系での距離) */
	px: number;
	/** Y方向の余白 (格子座標系での距離) */
	py: number;
	/** 塗りのあるマス目のリスト */
	cells: Array<[number, number]>;
}

interface BoundaryTracingContext extends BoundaryTracingProps {
	/** 拡大率 */
	z: number;
	/** セルの領域 */
	bb: BoundingBox;
	/** SVGの描画領域 */
	vb: BoundingBox;
	/** 画面上の1pxに相当する値 */
	dpx: number;
}

const BoundaryTracingContext = createContext<BoundaryTracingContext>({
	px: 0,
	py: 0,
	cells: [],
	z: 1,
	bb: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
	vb: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
	dpx: 1,
});

interface SvgProps extends Partial<BoundaryTracingProps> {
	title?: string;
	cells: Array<[number, number]>;
}

export const Svg = ({
	px = 2.3,
	py = 1.3,
	cells: rawCells = [],
	title = "BoundaryTracing",
	viewBox: givenViewBox,
	children,
	...props
}: PropsWithChildren<SvgProps & SVGAttributes<SVGSVGElement>>) => {
	const [svg, setSvg] = useState<SVGSVGElement | null>();
	const rect = useRect(svg);
	const cells = getUniqueCells(rawCells);
	const bb = getBoundingBox(cells);
	const sizeX = bb.maxX - bb.minX;
	const sizeY = bb.maxY - bb.minY;
	const baseWidth = sizeX + px * 2;
	const viewBox = useMemo((): ViewBox => {
		if (givenViewBox) {
			return [...parseViewBox(givenViewBox)] as ViewBox;
		}
		return [0.5 - px, 0.5 - py, baseWidth, sizeY + py * 2];
	}, [givenViewBox, baseWidth, sizeY, px, py]);
	const [vMinX, vMinY, vSizeX, vSizeY] = viewBox;
	const vb = getBoundingBox([
		[vMinX, vMinY],
		[vMinX + vSizeX, vMinY + vSizeY],
	]);
	useMemo<BoundingBox>(() => {
		const [minX, minY, sizeX, sizeY] = viewBox;
		return { minX, minY, maxX: minX + sizeX, maxY: minY + sizeY };
	}, [viewBox]);
	const z = baseWidth / vSizeX;
	const dpx = rect ? vSizeX / rect.width : 0;
	const context: BoundaryTracingContext = useMemo(
		() => ({ px, py, cells, z, bb, vb, dpx }),
		[px, py, cells, z, bb, vb, dpx],
	);
	return (
		<svg
			{...props}
			viewBox={viewBox.map((v) => r(v)).join(" ")}
			style={{ fontSize: `${r(18 * dpx)}px`, ...props.style }}
			ref={setSvg}
		>
			<title>{title}</title>
			<BoundaryTracingContext.Provider value={context}>
				{children}
			</BoundaryTracingContext.Provider>
		</svg>
	);
};

export const Cells = ({
	className,
	...props
}: SVGAttributes<SVGRectElement>) => {
	const { cells, vb } = useContext(BoundaryTracingContext);
	const p = 0.04;
	const r = 0.08;
	const size = 1;
	const minX = vb.minX - size;
	const maxX = vb.maxX;
	const minY = vb.minY - size;
	const maxY = vb.maxY;
	return (
		<g className={classnames(style.fill, className)}>
			{cells.map((cell) => {
				const x = cell[0] + p;
				const y = cell[1] + p;
				if (x < minX || maxX < x || y < minY || maxY < y) {
					// viewBox外は描画しない
					return null;
				}
				return (
					<rect
						rx={r}
						ry={r}
						{...props}
						key={cell.join(",")}
						x={x}
						y={y}
						width={size - p * 2}
						height={size - p * 2}
					/>
				);
			})}
		</g>
	);
};

interface PathProps {
	strokePx?: number;
}

interface GridProps extends PathProps {
	dx?: number;
	dy?: number;
}

export const Grid = ({
	dx = 0,
	dy = 0,
	strokePx = 1,
	className,
	...props
}: GridProps & SVGAttributes<SVGPathElement>) => {
	const { px, py, bb, vb, dpx } = useContext(BoundaryTracingContext);
	const { minX, maxX, minY, maxY } = vb;
	let d = "";
	const x0 = getStart(1, minX, Math.ceil(bb.minX - px) + dx);
	for (let x = x0; x < maxX; x += 1) {
		d += `M${r(x)} ${r(minY)}V${r(maxY)}`;
	}
	const y0 = getStart(1, minY, Math.ceil(bb.minY - py) + dy);
	for (let y = y0; y < maxY; y += 1) {
		d += `M${r(minX)} ${r(y)}H${r(maxX)}`;
	}
	return (
		<path
			{...props}
			className={classnames(style.stroke, className)}
			d={d}
			style={{ strokeWidth: strokePx * dpx, ...props.style }}
		/>
	);
};

export const Boundary = ({
	strokePx = 1,
	className,
	...props
}: PathProps & SVGAttributes<SVGPathElement>) => {
	const { cells, dpx } = useContext(BoundaryTracingContext);
	let d = "";
	for (const [x1, y1, x2, y2] of getUnitEdges(cells).boundary) {
		d += getLineD(x1, y1, x2, y2);
	}
	return (
		<path
			{...props}
			className={classnames(style.stroke, className)}
			d={d}
			style={{ strokeWidth: strokePx * dpx, ...props.style }}
		/>
	);
};

interface EdgeProps extends PathProps {}

interface AllEdgesProps extends EdgeProps {
	modulo: number;
	remainder: number;
}

export const AllEdges = ({
	strokePx = 1,
	modulo,
	remainder,
	...props
}: AllEdgesProps & SVGAttributes<SVGPathElement>) => {
	const { cells, dpx, vb } = useContext(BoundaryTracingContext);
	const allEdges = getAllUnitEdges(cells);
	const edges = useMemo(
		() =>
			allEdges.filter(
				({ x, y }) => (modulo + ((x + y) % modulo)) % modulo === remainder,
			),
		[allEdges, modulo, remainder],
	);
	const arrowSize = dpx * 8;
	return (
		<path
			{...props}
			className={classnames(style.stroke, props.className)}
			style={{ strokeWidth: strokePx * dpx, ...props.style }}
			d={getEdgesInViewD(edges, vb, arrowSize, 0.1, 0.15)}
		/>
	);
};

export const BoundaryEdges = ({
	strokePx = 1,
	...props
}: EdgeProps & SVGAttributes<SVGPathElement>) => {
	const { cells, dpx, vb } = useContext(BoundaryTracingContext);
	const arrowSize = dpx * 8;
	return (
		<path
			{...props}
			className={classnames(style.stroke, props.className)}
			style={{ strokeWidth: strokePx * dpx, ...props.style }}
			d={getEdgesInViewD(
				getUnitEdges(cells).boundary,
				vb,
				arrowSize,
				0.1,
				0.15,
			)}
		/>
	);
};

export const NonBoundaryEdges = ({
	strokePx = 1,
	...props
}: EdgeProps & SVGAttributes<SVGPathElement>) => {
	const { cells, dpx, vb } = useContext(BoundaryTracingContext);
	const arrowSize = dpx * 8;
	return (
		<path
			{...props}
			className={classnames(style.stroke, props.className)}
			style={{ strokeWidth: strokePx * dpx, ...props.style }}
			d={getEdgesInViewD(
				getUnitEdges(cells).nonBoundary,
				vb,
				arrowSize,
				0.1,
				0.15,
			)}
		/>
	);
};

export const CellDelimiters = ({
	strokePx = 1,
	...props
}: EdgeProps & SVGAttributes<SVGPathElement>) => {
	const { cells, dpx, vb } = useContext(BoundaryTracingContext);
	return (
		<path
			{...props}
			className={classnames(style.stroke, props.className)}
			style={{ strokeWidth: strokePx * dpx, ...props.style }}
			d={getEdgesInViewD(getUnitEdges(cells).cellDelimiter, vb, 0, 0, 0.2)}
		/>
	);
};

const getBoundingBox = memoize(
	(cells: Array<[number, number]>): BoundingBox => {
		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;
		for (const [x, y] of cells) {
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);
		}
		return { minX, minY, maxX, maxY };
	},
);

const getUniqueCells = memoize(
	(cells: Array<[number, number]>): Array<[number, number]> =>
		cells
			.filter(
				(a, i) => i === cells.findIndex((b) => a[0] === b[0] && a[1] === b[1]),
			)
			.sort((c1, c2) => {
				const d = c1[0] + c1[1] - (c2[0] + c2[1]);
				return d === 0 ? c1[1] - c2[1] : d;
			}),
);

const getAllUnitEdges = memoize((cells: Array<[number, number]>) => [
	...(function* (): Generator<CellEdge> {
		const cellEdge = (edge: Edge, x: number, y: number): CellEdge =>
			Object.assign(edge, { x, y });
		for (const [x, y] of cells) {
			yield cellEdge([x, y, x + 1, y], x, y);
			yield cellEdge([x + 1, y, x + 1, y + 1], x, y);
			yield cellEdge([x + 1, y + 1, x, y + 1], x, y);
			yield cellEdge([x, y + 1, x, y], x, y);
		}
	})(),
]);

const getUnitEdges = memoize((cells: Array<[number, number]>) => {
	const allEdges = getAllUnitEdges(cells);
	const edgesToBeIgnored = new Set<Edge>();
	const boundary: Array<Edge> = [];
	const nonBoundary: Array<Edge> = [];
	for (const edge of allEdges) {
		if (!edgesToBeIgnored.has(edge)) {
			const oppositeTemp = getOppositeEdge(edge);
			const opposite = allEdges.find((e) => isSameEdge(e, oppositeTemp));
			if (opposite) {
				nonBoundary.push(edge, opposite);
				edgesToBeIgnored.add(opposite);
			} else {
				boundary.push(edge);
			}
		}
	}
	return { boundary, nonBoundary, cellDelimiter: [...edgesToBeIgnored] };
});

const getEdgesInViewD = (
	edges: Array<Edge>,
	vb: BoundingBox,
	arrowSize: number,
	offset1: number,
	offset2: number,
) => {
	const offsetMap: Record<Direction, Edge> = {
		[Direction.Right]: [offset2, offset1, -offset2, offset1],
		[Direction.Down]: [-offset1, offset2, -offset1, -offset2],
		[Direction.Left]: [-offset2, -offset1, offset2, -offset1],
		[Direction.Up]: [offset1, -offset2, offset1, offset2],
	};
	let d = "";
	if (arrowSize === 0) {
		for (const edge of listEdgesInView(edges, offsetMap, vb)) {
			d += getLineD(...edge);
		}
	} else {
		for (const edge of listEdgesInView(edges, offsetMap, vb)) {
			d += getArrowD(edge, arrowSize);
		}
	}
	return d;
};

const listEdgesInView = function* (
	edges: Iterable<Edge>,
	offsetMap: Record<Direction, Edge>,
	vb: BoundingBox,
): Generator<Edge> {
	for (const edge of edges) {
		const offset = offsetMap[getDirection(edge)];
		const svgEdge: Edge = [
			edge[0] + offset[0],
			edge[1] + offset[1],
			edge[2] + offset[2],
			edge[3] + offset[3],
		];
		if (isEdgeInView(vb, svgEdge)) {
			yield svgEdge;
		}
	}
};

interface NormalizeAnimationAppProps extends SvgProps {
	/** アニメーション1周の長さ(ms)  */
	durationMs?: number;
	/** リピートまでの遅延(ms) */
	repeatDelayMs?: number;
	/** 自動再生する場合にtrue */
	autoPlay?: boolean;
	/** 方向パターン選択肢を表示する場合にtrue */
	displayTurnType?: boolean;
}

const TurnType = { Left: 0, Right: 1 } as const;
type TurnType = ValueOf<typeof TurnType>;

interface EdgeData {
	normalized: Array<Array<Edge>>;
	remainder: Array<Edge>;
}

export const NormalizeAnimationApp = ({
	durationMs = 8000,
	repeatDelayMs = 100,
	autoPlay: initialAutoPlay = true,
	displayTurnType = false,
	...props
}: NormalizeAnimationAppProps) => {
	const [turnType, setTurnType] = useState<TurnType>(TurnType.Left);
	const [pre, setPre] = useState<HTMLPreElement | null>();
	const figureId = useMemo(() => {
		return pre?.closest("figure")?.querySelector(".fragment-target")?.id || "_";
	}, [pre]);
	const [phase, setPhase] = useState<number>(0);
	const [autoPlay, setAutoPlay] = useState<boolean>(initialAutoPlay);
	const phraseRef = useRef(phase);
	phraseRef.current = phase;
	const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setPhase(Number.parseFloat(event.currentTarget.value));
		setAutoPlay(false);
	}, []);
	const isInView = useIsInView(pre);
	const isPlaying = autoPlay && isInView;
	useEffect(() => {
		let frameId = 0;
		if (isPlaying) {
			frameId = requestAnimationFrame((t0) => {
				const totalMs = repeatDelayMs + durationMs;
				const startedAt = t0 - phraseRef.current * durationMs;
				const animate = (timestamp: number) => {
					const p = ((timestamp - startedAt) % totalMs) / durationMs;
					setPhase(clamp(p, 0, 1));
					frameId = requestAnimationFrame(animate);
				};
				frameId = requestAnimationFrame(animate);
			});
		}
		return () => cancelAnimationFrame(frameId);
	}, [isPlaying, durationMs, repeatDelayMs]);
	const onClickPlay = useCallback(() => setAutoPlay((v) => !v), []);
	const { boundary } = getUnitEdges(props.cells);
	const consumeLimit = Math.floor((boundary.length + 1) * phase);
	const edges = useMemo(() => {
		let consumeCount = 0;
		const generator = listNormalizedEdges(boundary, turnType);
		let edgeData: EdgeData = { normalized: [], remainder: [] };
		while (consumeCount++ <= consumeLimit) {
			const result = generator.next();
			if (result.done) {
				break;
			}
			edgeData = result.value;
		}
		return edgeData;
	}, [turnType, boundary, consumeLimit]);
	const pathPartsCount = useMemo(() => {
		let lastEdgeData: EdgeData = { normalized: [], remainder: [] };
		for (const result of listNormalizedEdges(boundary, turnType)) {
			lastEdgeData = result;
		}
		return lastEdgeData.normalized.length;
	}, [turnType, boundary]);
	const dList = useMemo(
		() => [
			...(function* () {
				let count = 0;
				for (const edgeList of edges.normalized) {
					for (const d of listEdgesD(edgeList, true)) {
						yield { d, key: count++ };
					}
				}
				for (const d of listEdgesD(edges.remainder)) {
					yield { d, key: count++ };
				}
				while (count <= pathPartsCount) {
					yield { d: " ", key: count++ };
				}
			})(),
		],
		[edges, pathPartsCount],
	);
	const totalCountStyle = {
		"--gjTotalCount": `${pathPartsCount}`,
	} as CSSProperties;
	return (
		<>
			<Svg {...props} style={totalCountStyle}>
				<Grid strokePx={2} style={{ color: "var(--gjGray3)" }} />
				<Cells style={{ color: "var(--gjGray3)" }} />
				<NormalizedPath edges={edges} />
			</Svg>
			<div className={style.control}>
				<button
					type="button"
					className={IconClass}
					value="-"
					onClick={onClickPlay}
				>
					{isPlaying ? "stop_circle" : "play_circle"}
				</button>
				<input
					min={0}
					max={1}
					step={0.001}
					value={phase.toFixed(4)}
					type="range"
					onChange={onChange}
				/>
				{displayTurnType && (
					<TurnTypeSelector
						turnType={turnType}
						figureId={figureId}
						onChangeValue={setTurnType}
					/>
				)}
				<pre ref={setPre} style={totalCountStyle}>
					{dList.map(({ d, key }, index) => {
						const isNormalized = index < edges.normalized.length;
						const codeStyle = { "--gjIndex": `${index}` } as CSSProperties;
						return (
							<code
								key={key}
								className={classnames(
									isNormalized && style.indexColor,
									!d.trim() && style.empty,
								)}
								style={isNormalized ? codeStyle : undefined}
							>
								<span>{d}</span>
							</code>
						);
					})}
				</pre>
			</div>
		</>
	);
};

interface TurnTypeSelectorProps {
	turnType: TurnType;
	figureId: string;
	onChangeValue: (value: TurnType) => void;
}

const TurnTypeSelector = ({
	turnType,
	figureId,
	onChangeValue,
}: TurnTypeSelectorProps) => {
	const onChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const value = Number.parseInt(event.currentTarget.value, 10);
			for (const type of Object.values(TurnType)) {
				if (value === type) {
					onChangeValue(type);
					break;
				}
			}
		},
		[onChangeValue],
	);
	return (
		<div className={style.turnType}>
			{[...Object.values(TurnType)].map((type) => {
				const name = `${figureId}TurnType`;
				const id = `${figureId}TurnType${type}`;
				return (
					<Fragment key={id}>
						<input
							type="radio"
							name={name}
							id={id}
							value={type}
							onChange={onChange}
							checked={type === turnType}
						/>
						<label htmlFor={id}>
							{
								{
									[TurnType.Left]: "左折優先",
									[TurnType.Right]: "右折優先",
								}[type]
							}
						</label>
					</Fragment>
				);
			})}
		</div>
	);
};

interface NormalizedPathProps {
	edges: EdgeData;
}

const NormalizedPath = ({ edges }: NormalizedPathProps) => {
	const { dpx, vb } = useContext(BoundaryTracingContext);
	return (
		<>
			{edges.normalized.map((edgeList, index) => {
				const d = getEdgesInViewD(edgeList, vb, dpx * 8, 0, 0.1);
				const pathStyle = { strokeWidth: 4 * dpx, "--gjIndex": `${index}` };
				return (
					<path
						key={d}
						className={classnames(style.stroke, style.indexColor)}
						style={pathStyle}
						d={d}
					/>
				);
			})}
			<path
				className={classnames(style.stroke)}
				style={{ strokeWidth: 4 * dpx, color: "var(--gjGray6)" }}
				d={getEdgesInViewD(edges.remainder, vb, dpx * 8, 0, 0.2)}
			/>
		</>
	);
};

const listNormalizedEdges = function* (
	edgeList: Array<Edge>,
	turnType: TurnType,
): Generator<EdgeData> {
	const remainder = edgeList.slice();
	let buffer: Array<Edge> = [];
	const normalized: Array<Array<Edge>> = [buffer];
	yield {
		normalized: normalized.slice(),
		remainder: remainder.slice(),
	};
	let edge = remainder.shift();
	while (edge) {
		if (buffer[buffer.length - 1] !== edge) {
			edge = edge.slice() as Edge;
			buffer.push(edge);
		}
		yield {
			normalized: normalized.slice(),
			remainder: remainder.slice(),
		};
		const currentDirection = getDirection(edge);
		const directionPriority = [
			Direction.Right,
			Direction.Down,
			Direction.Left,
			Direction.Up,
		];
		if (turnType === TurnType.Right) {
			directionPriority.reverse();
		}
		directionPriority.push(...directionPriority);
		for (let index = directionPriority.indexOf(currentDirection); index--; ) {
			directionPriority.push(directionPriority.shift() as Direction);
		}
		let next: { priority: number; edge: Edge; index: number } | undefined;
		for (let index = 0; index < remainder.length; index++) {
			const e = remainder[index];
			if (edge[2] === e[0] && edge[3] === e[1]) {
				const direction = getDirection(e);
				const priority = directionPriority.indexOf(direction);
				if (!next || priority < next.priority) {
					next = { priority, edge: e, index };
					if (priority === 0) {
						break;
					}
				}
			}
		}
		if (next) {
			remainder.splice(next.index, 1);
			if (next.priority === 0) {
				edge[2] = next.edge[2];
				edge[3] = next.edge[3];
			} else {
				edge = next.edge;
			}
		} else {
			buffer = [];
			normalized.push(buffer);
			edge = remainder.shift();
		}
	}
};

const listEdgesD = function* (
	edges: Iterable<Edge>,
	closePath = false,
): Generator<string> {
	let e0: Edge | undefined;
	let e1: Edge | undefined;
	let d = "";
	for (const e2 of edges) {
		if (!e0) {
			e0 = e2;
		}
		if (!e1 || e1[2] !== e2[0] || e1[3] !== e2[1]) {
			if (closePath && e1 && e1[2] === e0[0] && e1[3] === e0[1]) {
				yield `${d}Z`;
				e0 = e2;
				d = "";
			}
			d += `M${r(e2[0])} ${r(e2[1])}`;
		}
		d += getNextDFragment(...e2);
		e1 = e2;
	}
	if (closePath && e0 && e1 && e1[2] === e0[0] && e1[3] === e0[1]) {
		d += "Z";
	}
	if (d) {
		yield d;
	}
};
