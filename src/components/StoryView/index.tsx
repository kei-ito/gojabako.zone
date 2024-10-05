import { isFunction } from "@nlib/typing";
import type {
	ComponentType,
	HTMLAttributes,
	PropsWithChildren,
	ReactNode,
} from "react";
import * as style from "./style.module.scss";

const Heading = (props: PropsWithChildren) => {
	return <h2 className={style.heading}>{props.children}</h2>;
};

const listColumnHeadings = function* (labelList: Array<ReactNode>, offset = 0) {
	const r = 1;
	let c = offset;
	for (const label of labelList) {
		yield (
			<dt
				key={`${r}${c}`}
				style={{ gridArea: `${r} / ${++c} / ${r + 1} / ${c + 1}` }}
			>
				{label}
			</dt>
		);
	}
};

const listRowHeadings = function* (labelList: Array<ReactNode>, offset = 0) {
	let r = offset;
	const c = 1;
	for (const label of labelList) {
		const gridArea = `${++r} / ${c} / ${r + 1} / ${c + 1}`;
		yield (
			<dt key={`${r}${c}`} style={{ gridArea }}>
				{label}
			</dt>
		);
	}
};

type KVList<T> = Iterable<[ReactNode, T]> | Record<string, T>;
const isIterable = <T,>(input: Iterable<T> | object): input is Iterable<T> => {
	return Symbol.iterator in input && isFunction(input[Symbol.iterator]);
};

const parseTuples = <T,>(tuples: KVList<T>) => {
	const labels = [];
	const values = [];
	const iter = isIterable(tuples) ? tuples : Object.entries(tuples);
	for (const [label, value] of iter) {
		labels.push(label);
		values.push(value);
	}
	return { labels, values };
};

interface TableProps<C, R>
	extends Omit<HTMLAttributes<HTMLDListElement>, "title"> {
	title?: ReactNode;
	columns: KVList<C>;
	rows: KVList<R>;
	render: ComponentType<{ column: C; row: R }>;
	cellProps?: HTMLAttributes<HTMLElement>;
}

const Table = <C, R>({
	title,
	columns,
	rows,
	render: Render,
	cellProps,
	...props
}: TableProps<C, R>) => {
	const { labels: columnLabels, values: columnValues } = parseTuples(columns);
	const { labels: rowLabels, values: rowValues } = parseTuples(rows);
	const listItems = function* () {
		let rowCount = 0;
		for (const row of rowValues) {
			let columnCount = 0;
			for (const column of columnValues) {
				yield { column, columnCount, row, rowCount };
				columnCount += 1;
			}
			rowCount += 1;
		}
	};
	return (
		<dl {...props} className={style.table}>
			<dt>{title}</dt>
			{[...listColumnHeadings(columnLabels, 1)]}
			{[...listRowHeadings(rowLabels, 1)]}
			{[...listItems()].map(({ column, columnCount, row, rowCount }) => {
				const c = columnCount + 2;
				const r = rowCount + 2;
				const gridArea = `${r} / ${c} / ${r + 1} / ${c + 1}`;
				const style = {
					...cellProps?.style,
					gridArea,
				};
				return (
					<dd {...cellProps} key={gridArea} style={style}>
						<Render row={row} column={column} />
					</dd>
				);
			})}
		</dl>
	);
};

interface ColumnsProps<C> extends HTMLAttributes<HTMLDListElement> {
	columns: KVList<C>;
	render: ComponentType<{ column: C }>;
	cellProps?: HTMLAttributes<HTMLElement>;
}

const Columns = <C,>({
	columns,
	render: Render,
	cellProps,
	...props
}: ColumnsProps<C>) => {
	const { labels: columnLabels, values: columnValues } = parseTuples(columns);
	return (
		<dl {...props} className={style.columns}>
			{[...listColumnHeadings(columnLabels)]}
			{columnValues.map((columnValue, i) => {
				const key = `col-${i}`;
				const style = {
					...cellProps?.style,
					gridColumn: `${i + 1} / ${i + 2}`,
				};
				return (
					<dd {...cellProps} key={key} style={style}>
						<Render column={columnValue} />
					</dd>
				);
			})}
		</dl>
	);
};

interface RowsProps<R> extends HTMLAttributes<HTMLDListElement> {
	rows: KVList<R>;
	render: ComponentType<{ row: R }>;
	cellProps?: HTMLAttributes<HTMLElement>;
}

const Rows = <R,>({
	rows,
	render: Render,
	cellProps,
	...props
}: RowsProps<R>) => {
	const { labels: rowLabels, values: rowValues } = parseTuples(rows);
	return (
		<dl {...props} className={style.rows}>
			{[...listRowHeadings(rowLabels)]}
			{rowValues.map((rowValue, i) => {
				const key = `row-${i}`;
				const style = {
					...cellProps?.style,
					gridRow: `${i + 1} / ${i + 2}`,
				};
				return (
					<dd {...cellProps} key={key} style={style}>
						<Render row={rowValue} />
					</dd>
				);
			})}
		</dl>
	);
};

const Gallery = (props: PropsWithChildren) => (
	<main className={style.gallery}>{props.children}</main>
);

const FullScreen = (props: PropsWithChildren) => <main>{props.children}</main>;

export const StoryView = {
	Heading,
	Table,
	Columns,
	Rows,
	Gallery,
	FullScreen,
};
