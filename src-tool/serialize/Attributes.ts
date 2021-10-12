import type {SerializeMarkdownOption} from '../util/serializeMarkdownOption';
import {filterAttribute} from '../util/serializeMarkdownOption';
import {serializeStringToJsxSafeString} from './StringToJsxSafeString';
import {serializeStyle} from './Style';

export type Attributes = Record<string, boolean | string | null | undefined>;

export const serializeAttributes = function* (
    attributes: Attributes | null | undefined,
    option: SerializeMarkdownOption,
): Generator<string> {
    if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            const attributeName = filterAttribute(key, option);
            if (attributeName) {
                if (value === true) {
                    yield ` ${attributeName}=""`;
                } else if (typeof value === 'string') {
                    if (option.jsx && attributeName === 'style') {
                        yield ` ${attributeName}={`;
                        yield* serializeStyle(value);
                        yield '}';
                    } else {
                        yield ` ${attributeName}="`;
                        yield* serializeStringToJsxSafeString(value);
                        yield '"';
                    }
                }
            }
        }
    }
};
