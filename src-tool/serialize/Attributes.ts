import {serializeStringToJsxSafeString} from './StringToJsxSafeString';

export type Attributes = Record<string, boolean | string | null | undefined>;

export const serializeAttributes = function* (
    attributes?: Attributes | null,
): Generator<string> {
    if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            if (value === true) {
                yield ` ${key}=""`;
            } else if (value) {
                yield ` ${key}="`;
                yield* serializeStringToJsxSafeString(value);
                yield '"';
            }
        }
    }
};
