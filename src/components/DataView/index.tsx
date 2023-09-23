import { entries, getType, isArray, isObject, isString } from '@nlib/typing';
import { Fragment } from 'react';
import { classnames } from '../../util/classnames.mts';
import * as style from './style.module.scss';

export interface DataViewProps<T = unknown> {
  value: T;
}

export const DataView = <T,>({ value }: DataViewProps<T>) => (
  <Value value={value} className={style.container} />
);

interface ValueProps<T> {
  value: T;
  className?: string;
}

// eslint-disable-next-line max-lines-per-function
const Value = <T,>({ value, className }: ValueProps<T>) => {
  const type = getType(value);
  if (value instanceof Date) {
    return (
      <dd className={classnames(className, style.primitive)}>
        <span className={style.type}>{getType(value)}</span>
        <span className={style.value}>{value.toLocaleString()}</span>
      </dd>
    );
  }
  if (value instanceof RegExp) {
    return (
      <dd className={classnames(className, style.primitive)}>
        <span className={style.type}>{getType(value)}</span>
        <span className={style.value}>{value.toString()}</span>
      </dd>
    );
  }
  if (value instanceof Error) {
    return (
      <dd className={classnames(className, style.primitive)}>
        <span className={style.type}>{getType(value)}</span>
        <span className={style.value}>{value.stack}</span>
      </dd>
    );
  }
  if (value instanceof Set) {
    return (
      <dd className={className}>
        <KVView type="Set" items={entries([...value])} />
      </dd>
    );
  }
  if (value instanceof Map) {
    return (
      <dd className={className}>
        <KVView type="Map" items={value} />
      </dd>
    );
  }
  if (isArray(value)) {
    return (
      <dd className={className}>
        <KVView type={type} items={entries(value)} />
      </dd>
    );
  }
  if (isObject(value)) {
    return (
      <dd className={className}>
        <KVView type={type} items={entries(value)} />
      </dd>
    );
  }
  let s = '';
  if (value === Infinity) {
    s = '+Infinity';
  } else if (value === -Infinity) {
    s = '-Infinity';
  } else if (Number.isNaN(value)) {
    s = 'NaN';
  } else if (isString(value)) {
    s = value;
  } else {
    switch (type) {
      case 'ArrayBuffer':
      case 'WeakSet':
      case 'WeakMap':
        break;
      default:
        s = JSON.stringify(value);
    }
  }
  return (
    <dd className={classnames(className, style.primitive)}>
      <span className={style.type}>{getType(value)}</span>
      <span className={style.value}>{s}</span>
    </dd>
  );
};

interface KVViewProps {
  type: string;
  items: Iterable<[string, unknown]>;
}

const KVView = ({ type, items }: KVViewProps) => (
  <dl className={style.kv}>
    <span className={style.type}>{type}</span>
    {[...items].map(([k, v], index, { length }) => {
      const first = index === 0;
      const last = index === length - 1;
      const c = classnames(first && style.first, last && style.last);
      return (
        <Fragment key={k}>
          <dt className={c}>{k}</dt>
          <Value value={v} className={c} />
        </Fragment>
      );
    })}
  </dl>
);
