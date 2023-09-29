'use client';
import { ensure, isFiniteNumber } from '@nlib/typing';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes, MouseEvent } from 'react';
import { clamp } from '../../util/clamp.mts';
import { IconClass, classnames } from '../../util/classnames.mts';
import { noop } from '../../util/noop.mts';
import type { Range } from '../../util/range.mts';
import { useLastValue } from '../use/LastValue.mts';
import * as style from './style.module.scss';

const v = (value: ReadonlyArray<string> | number | string): number =>
  ensure(Number(value), isFiniteNumber);
const log = (value: number, [min, max]: Range): number => {
  const logValue = Math.log(clamp(value, min, max));
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  return (logValue - logMin) / (logMax - logMin);
};
const linear = (ratio: number, [min, max]: Range) => {
  return min * Number((max / min) ** ratio);
};

export interface ZoomSliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onChangeValue?: (value: number) => void;
}

// eslint-disable-next-line max-lines-per-function
export const ZoomSlider = ({
  name,
  className,
  min: zMin = 0.1,
  max: zMax = 2,
  value: zValue = 1,
  onChangeValue = noop,
  onChange: onChangeFn = noop,
  ...props
}: ZoomSliderProps) => {
  const range = useMemo((): Range => [v(zMin), v(zMax)], [zMin, zMax]);
  const [ratio, setRatio] = useState<number>(log(v(zValue), range));
  const value = useMemo(() => linear(ratio, range), [ratio, range]);
  const lastValue = useLastValue(value, null);
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChangeFn(event);
      setRatio(clamp(v(event.currentTarget.value), 0, 1));
    },
    [onChangeFn],
  );
  useEffect(
    () => {
      if (lastValue !== null && value !== lastValue) {
        onChangeValue(value);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value],
  );
  useEffect(
    () => {
      if (lastValue !== null) {
        setRatio(log(v(zValue), range));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zValue, range],
  );
  const onClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    switch (event.currentTarget.value) {
      case '-':
        setRatio((r) => clamp(r - 0.1, 0, 1));
        break;
      case '+':
        setRatio((r) => clamp(r + 0.1, 0, 1));
        break;
      default:
    }
  }, []);
  return (
    <div className={classnames(style.container, className)}>
      {name && <input type="hidden" name={name} value={value} />}
      <button className={IconClass} value="-" onClick={onClick}>
        zoom_out
      </button>
      <input
        {...props}
        value={ratio}
        min={0}
        max={1}
        step={0.001}
        type="range"
        onChange={onChange}
      />
      <button className={IconClass} value="+" onClick={onClick}>
        zoom_in
      </button>
    </div>
  );
};
