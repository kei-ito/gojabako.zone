import type {SerializeOption} from '../util/serializeOption';
import {filterAttribute} from '../util/serializeOption';
import {serializeStringToJsxSafeString} from './StringToJsxSafeString';

export type Attributes = Record<string, boolean | string | null | undefined>;

export const serializeAttributes = function* (
    attributes: Attributes | null | undefined,
    option: SerializeOption,
): Generator<string> {
    if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            const attributeName = filterAttribute(key, option);
            if (value === true) {
                yield ` ${attributeName}=""`;
            } else if (typeof value === 'string') {
                yield ` ${attributeName}="`;
                yield* serializeStringToJsxSafeString(value);
                yield '"';
            }
        }
    }
};
