export const removeHtmlComments = (source: string) => [...serialize(source)].join('');

const serialize = function* (
    source: string,
): Generator<string> {
    const start = '<!--';
    const end = '-->';
    let index = 0;
    const sourceLength = source.length;
    while (index < sourceLength) {
        const startIndex = source.indexOf(start, index);
        if (startIndex < 0) {
            yield source.slice(index);
            break;
        } else if (index < startIndex) {
            yield source.slice(index, startIndex);
        }
        const endIndex = source.indexOf(end, startIndex);
        if (endIndex < 0) {
            yield source.slice(startIndex);
            break;
        } else {
            index = endIndex + end.length;
        }
    }
};
