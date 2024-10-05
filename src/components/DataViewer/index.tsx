import { getType, isArray, isObject, isUndefined } from "@nlib/typing";
import type { HTMLAttributes, ReactNode } from "react";
import { Fragment } from "react";
import { classnames } from "../../util/classnames.ts";
import { serializeFileSize } from "../../util/serializeFileSize.ts";
import * as style from "./style.module.scss";

export interface DataViewerProps<T = unknown>
	extends HTMLAttributes<HTMLElement> {
	value: T;
}

export const DataViewer = <T,>({ value, ...props }: DataViewerProps<T>) => (
	<Value value={value} className={style.container} depth={0} ddProps={props} />
);

interface ValueProps<T> {
	value: T;
	className?: string;
	depth: number;
	ddProps?: HTMLAttributes<HTMLElement>;
}

const Value = <T,>({
	value,
	className,
	depth,
	ddProps = {},
}: ValueProps<T>) => {
	const type = getType(value);
	if (value instanceof Date) {
		return (
			<dd
				{...ddProps}
				className={classnames(className, style.primitive, ddProps.className)}
			>
				<span className={style.value}>Date ({value.toLocaleString()})</span>
			</dd>
		);
	}
	if (value instanceof RegExp) {
		return (
			<dd
				{...ddProps}
				className={classnames(className, style.primitive, ddProps.className)}
			>
				<span className={style.value}>{value.toString()}</span>
			</dd>
		);
	}
	if (value instanceof Error) {
		return (
			<dd
				{...ddProps}
				className={classnames(className, style.primitive, ddProps.className)}
			>
				<span className={style.value}>{value.stack}</span>
			</dd>
		);
	}
	if (value instanceof Set) {
		return (
			<dd
				{...ddProps}
				title={`${type}(${value.size})`}
				className={classnames(className, ddProps.className)}
			>
				<KVView items={Object.entries([...value])} depth={depth} />
			</dd>
		);
	}
	if (value instanceof Map) {
		return (
			<dd
				{...ddProps}
				title={`${type}(${value.size})`}
				className={classnames(className, ddProps.className)}
			>
				<KVView items={value} depth={depth} />
			</dd>
		);
	}
	if (value instanceof WeakSet || value instanceof WeakMap) {
		return (
			<dd
				{...ddProps}
				title={type}
				className={classnames(className, ddProps.className)}
			/>
		);
	}
	if (value instanceof ArrayBuffer) {
		return (
			<dd {...ddProps} className={classnames(className, ddProps.className)}>
				<BufferView type={type} buffer={{ buffer: value }} depth={depth} />
			</dd>
		);
	}
	if (isArray(value)) {
		return (
			<dd
				{...ddProps}
				title={`${type}(${value.length})`}
				className={classnames(className, ddProps.className)}
			>
				<KVView items={Object.entries(value)} depth={depth} />
			</dd>
		);
	}
	if (isObject(value)) {
		if (isTypedArrayLike(value)) {
			return (
				<dd {...ddProps} className={classnames(className, ddProps.className)}>
					<BufferView type={type} buffer={value} depth={depth} />
				</dd>
			);
		}
		let v: Record<string, unknown> = value;
		if (type === "CryptoKey") {
			v = {
				type: v.type,
				algorithm: v.algorithm,
				extractable: v.extractable,
				usages: v.usages,
			};
		}
		const items = Object.entries(v);
		return (
			<dd
				{...ddProps}
				title={`${type}(${items.length})`}
				className={classnames(className, ddProps.className)}
			>
				<KVView items={items} depth={depth} />
			</dd>
		);
	}
	let s = "";
	if (value === Number.POSITIVE_INFINITY) {
		s = "+Infinity";
	} else if (value === Number.NEGATIVE_INFINITY) {
		s = "-Infinity";
	} else if (Number.isNaN(value)) {
		s = "NaN";
	} else if (isUndefined(value)) {
		s = "undefined";
	} else {
		s = JSON.stringify(value);
	}
	return (
		<dd
			{...ddProps}
			className={classnames(className, style.primitive, ddProps.className)}
			data-type={type}
		>
			{s && <span className={style.value}>{s}</span>}
		</dd>
	);
};

interface KVViewProps {
	items: Iterable<[string, unknown]>;
	depth: number;
}

const KVView = ({ items, depth }: KVViewProps) => (
	<Fragment>
		{[...items].map(([k, v]) => (
			<dl key={k} className={style.kv} data-depth={`${depth}`}>
				<dt>{k}:</dt>
				<Value value={v} depth={depth + 1} />
			</dl>
		))}
	</Fragment>
);

interface BufferViewProps {
	type: string;
	buffer: { buffer: ArrayBuffer };
	depth: number;
}

const BufferView = ({ type, buffer, depth }: BufferViewProps) => {
	const view = new Uint8Array(buffer.buffer);
	const showAsciiView = view instanceof Uint8Array;
	const listLines = function* (): Generator<ReactNode> {
		for (const [start, , line, c] of listBufferLines(view, 16)) {
			const title = `0x${start.toString(16).padStart(2, "0")}`;
			yield (
				<dt key={`${title}head`} className={classnames(c, style.buffer)}>
					{title}:
				</dt>
			);
			yield (
				<dd
					key={`${title}body`}
					className={classnames(c, style.value, style.buffer)}
				>
					{line.map((v, index) => {
						const pos = start + index;
						const key = `line-${index}`;
						return (
							<span key={key} title={`0x${pos.toString(16)} (${pos})`}>
								{0 <= v ? v.toString(16).padStart(2, "0") : "  "}
							</span>
						);
					})}
					{showAsciiView && (
						<>
							<hr />
							{line.map((v, index) => {
								const key = `ascii-${index}`;
								return (
									<span className={style.ascii} key={key}>
										{0 <= v ? String.fromCodePoint(v) : " "}
									</span>
								);
							})}
						</>
					)}
				</dd>
			);
		}
	};
	return (
		<dl
			className={style.kv}
			title={`${type} (${serializeFileSize(view.byteLength)})`}
			data-type={type}
			data-depth={`${depth}`}
		>
			{[...listLines()]}
		</dl>
	);
};

type Line = [number, number, Array<number>, string?];
const listBufferLines = function* (
	view: Iterable<number>,
	lineWidth: number,
	maxPos = lineWidth * 40,
): Generator<Line> {
	let pos = 0;
	let lastLine: Line | undefined;
	let line: Array<number> = [];
	for (const v of view) {
		if (lineWidth <= line.push(v)) {
			if (lastLine) {
				yield lastLine;
				lastLine = [pos, pos + lineWidth - 1, line];
			} else {
				lastLine = [pos, pos + lineWidth - 1, line];
			}
			line = [];
			pos += lineWidth;
			if (maxPos <= pos) {
				break;
			}
		}
	}
	if (lastLine) {
		yield lastLine;
	}
	if (0 < line.length) {
		while (line.length < lineWidth) {
			line.push(-1);
		}
		yield [pos, pos + line.length - 1, line];
	}
};

const isTypedArrayLike = (
	input: Record<string, unknown>,
): input is { buffer: ArrayBuffer } => {
	return input.buffer instanceof ArrayBuffer;
};
