"use client";
import { ensure, isFiniteNumber } from "@nlib/typing";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { clamp } from "../../util/clamp.ts";
import type { Range } from "../../util/range.ts";
import { useLastValue } from "../use/LastValue.ts";

const v = (value: ReadonlyArray<string> | number | string): number =>
	ensure(Number(value), isFiniteNumber);
export const toLogValue = (value: number, [min, max]: Range): number => {
	const logValue = Math.log(clamp(value, min, max));
	const logMin = Math.log(min);
	const logMax = Math.log(max);
	return (logValue - logMin) / (logMax - logMin);
};
export const toLinearValue = (ratio: number, [min, max]: Range) => {
	return min * Number((max / min) ** ratio);
};
export const defaultLinearRange = [0.1, 2];
export interface LogSliderProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "max" | "min" | "type"> {
	min: number;
	max: number;
	onChangeValue?: (value: number) => void;
}
export const LogSlider = ({
	min,
	max,
	defaultValue = 1,
	value: zValue = defaultValue,
	onChangeValue,
	onChange: onChangeFn,
	...props
}: LogSliderProps) => {
	const range = useMemo((): Range => [min, max], [min, max]);
	const [ratio, setRatio] = useState<number>(toLogValue(v(zValue), range));
	const value = useMemo(() => toLinearValue(ratio, range), [ratio, range]);
	const lastValue = useLastValue(value, null);
	const onChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			if (onChangeFn) {
				onChangeFn(event);
			}
			setRatio(clamp(v(event.currentTarget.value), 0, 1));
		},
		[onChangeFn],
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: valueのみ見る
	useEffect(() => {
		if (lastValue !== null && value !== lastValue && onChangeValue) {
			onChangeValue(value);
		}
	}, [value]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: zValue,rangeのみ見る
	useEffect(() => {
		if (lastValue !== null) {
			setRatio(toLogValue(v(zValue), range));
		}
	}, [zValue, range]);
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
