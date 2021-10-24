import {serializeStyle} from './Style';
import {Map, Object} from '../es/global';
import {toJsxSafeString} from '../es/toJsxSafeString';

export type Attributes = Record<string, boolean | string | null | undefined>;
const mapping = new Map<string, string>();
mapping.set('class', 'className');
mapping.set('charset', 'charSet');
mapping.set('frameborder', 'frameBorder');
mapping.set('allowfullscreen', 'allowFullScreen');
mapping.set('preserveaspectratio', 'preserveAspectRatio');
mapping.set('viewbox', 'viewBox');
mapping.set('xmlns', '');

export interface SerializeAttributeOptions {
    jsx: boolean,
}

export const serializeAttributes = function* (
    attributes: Attributes | null | undefined,
    {jsx}: SerializeAttributeOptions,
): Generator<string> {
    if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            let attributeName = key;
            if (jsx) {
                const filtered = mapping.get(attributeName);
                if (typeof filtered !== 'undefined') {
                    attributeName = filtered;
                }
            }
            if (attributeName) {
                if (value === true) {
                    yield ` ${attributeName}=""`;
                } else if (typeof value === 'string') {
                    if (jsx && attributeName === 'style') {
                        yield ` ${attributeName}={`;
                        yield* serializeStyle(value);
                        yield '}';
                    } else {
                        yield ` ${attributeName}="`;
                        yield toJsxSafeString(value);
                        yield '"';
                    }
                }
            }
        }
    }
};
