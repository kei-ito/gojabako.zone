import {
	isBoolean,
	isFiniteNumber,
	isObject,
	isSafeInteger,
	isString,
} from "@nlib/typing";

interface OtelString {
	stringValue: string;
}
interface OtelBoolean {
	boolValue: boolean;
}
interface OtelInteger {
	intValue: number;
}
interface OtelDouble {
	doubleValue: number;
}
interface OtelArray {
	arrayValue: { values: OtelValue[] };
}
type OtelValue =
	| OtelString
	| OtelBoolean
	| OtelInteger
	| OtelDouble
	| OtelArray;

export const toOtelValue = (value: unknown): OtelValue | null => {
	if (isString(value)) {
		return { stringValue: value };
	}
	if (isBoolean(value)) {
		return { boolValue: value };
	}
	if (isSafeInteger(value)) {
		return { intValue: value };
	}
	if (isFiniteNumber(value)) {
		return { doubleValue: value };
	}
	if (Array.isArray(value)) {
		return {
			arrayValue: {
				values: [
					...(function* () {
						for (const item of value) {
							const otelValue = toOtelValue(item);
							if (otelValue) {
								yield otelValue;
							}
						}
					})(),
				],
			},
		};
	}
	return null;
};

export const listOtelKeyValues = function* (record: unknown) {
	if (isObject(record)) {
		for (const [key, value] of Object.entries(record)) {
			const otelValue = toOtelValue(value);
			if (otelValue) {
				yield { key, value: otelValue };
			}
		}
	}
};
