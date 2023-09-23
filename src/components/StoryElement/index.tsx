import { entries, isFunction } from '@nlib/typing';
import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import * as style from './style.module.scss';

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
    yield (
      <dt
        key={`${r}${c}`}
        className={style.rh}
        style={{ gridArea: `${++r} / ${c} / ${r + 1} / ${c + 1}` }}
      >
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
  const iter = isIterable(tuples) ? tuples : entries(tuples);
  for (const [label, value] of iter) {
    labels.push(label);
    values.push(value);
  }
  return { labels, values };
};

interface TableProps<C, R> {
  title?: ReactNode;
  columns: KVList<C>;
  rows: KVList<R>;
  render: ComponentType<{ column: C; row: R }>;
}

const Table = <C, R>({
  title,
  columns,
  rows,
  render: Render,
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
    <dl className={style.table}>
      <dt className={style.title}>{title}</dt>
      {[...listColumnHeadings(columnLabels, 1)]}
      {[...listRowHeadings(rowLabels, 1)]}
      {[...listItems()].map(({ column, columnCount, row, rowCount }, i) => {
        const c = columnCount + 2;
        const r = rowCount + 2;
        return (
          <dd key={i} style={{ gridArea: `${r} / ${c} / ${r + 1} / ${c + 1}` }}>
            <Render row={row} column={column} />
          </dd>
        );
      })}
    </dl>
  );
};

interface ColumnsProps<C> {
  columns: KVList<C>;
  render: ComponentType<{ column: C }>;
}

const Columns = <C,>({ columns, render: Render }: ColumnsProps<C>) => {
  const { labels: columnLabels, values: columnValues } = parseTuples(columns);
  return (
    <dl className={style.columns}>
      {[...listColumnHeadings(columnLabels)]}
      {columnValues.map((columnValue, i) => (
        <dd key={i}>
          <Render column={columnValue} />
        </dd>
      ))}
    </dl>
  );
};

interface RowsProps<R> {
  rows: KVList<R>;
  render: ComponentType<{ row: R }>;
}

const Rows = <R,>({ rows, render: Render }: RowsProps<R>) => {
  const { labels: rowLabels, values: rowValues } = parseTuples(rows);
  return (
    <dl className={style.rows}>
      {[...listRowHeadings(rowLabels)]}
      {rowValues.map((rowValue, i) => (
        <dd key={i}>
          <Render row={rowValue} />
        </dd>
      ))}
    </dl>
  );
};

const Gallery = (props: PropsWithChildren) => (
  <main className={style.gallery}>{props.children}</main>
);

const FullScreen = (props: PropsWithChildren) => <main>{props.children}</main>;

export const StoryElement = {
  Heading,
  Table,
  Columns,
  Rows,
  Gallery,
  FullScreen,
};
