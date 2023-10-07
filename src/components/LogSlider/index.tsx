'use client';
import { ensure, isFiniteNumber } from '@nlib/typing';
import type { ChangeEvent, InputHTMLAttributes } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { clamp } from '../../util/clamp.mts';
import { noop } from '../../util/noop.mts';
import type { Range } from '../../util/range.mts';
import { useLastValue } from '../use/LastValue.mts';

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

export interface LogSliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onChangeValue?: (value: number) => void;
}

// eslint-disable-next-line max-lines-per-function
export const LogSlider = ({
  min: zMin = 0.1,
  max: zMax = 2,
  value: zValue = 1,
  onChangeValue = noop,
  onChange: onChangeFn = noop,
  ...props
}: LogSliderProps) => {
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
  return (
    <input
      {...props}
      value={ratio}
      min={0}
      max={1}
      step={0.001}
      type="range"
      onChange={onChange}
    />
  );
};
