import {executeRegExp} from '../es/executeRegExp';

export const readline = function* (
    input: string,
): Generator<string> {
    let lastIsLine = false;
    for (const line of executeRegExp(input, /\r\n|\r|\n/g)) {
        lastIsLine = typeof line === 'string';
        if (lastIsLine) {
            yield line as string;
        }
    }
    if (!lastIsLine) {
        yield '';
    }
};
