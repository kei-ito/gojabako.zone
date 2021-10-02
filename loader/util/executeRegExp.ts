export const executeRegExp = function* (
    input: string,
    regexp: RegExp,
): Generator<RegExpExecArray | string> {
    while (true) {
        const {lastIndex} = regexp;
        const matched = regexp.exec(input);
        if (matched) {
            const matchStartIndex = matched.index;
            yield input.slice(lastIndex, matchStartIndex);
            yield matched;
        } else {
            yield input.slice(lastIndex, input.length);
            break;
        }
    }
};
