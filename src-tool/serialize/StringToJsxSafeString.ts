import {executeRegExp} from '../../packages/es/executeRegExp';

export const serializeStringToJsxSafeString = function* (
    input: string,
): Generator<string> {
    for (const result of executeRegExp(input, /[{}<>\\]/g)) {
        if (typeof result === 'string') {
            yield result;
        } else {
            yield `&#${result[0].codePointAt(0)};`;
        }
    }
};

export const toJsxSafeString = (input: string) => [...serializeStringToJsxSafeString(input)].join('');
