export const getRelativePath = (
    from: string,
    to: string,
) => {
    const [slicedFrom, slicedTo] = removeCommonPart(from, to);
    if (!slicedFrom && !slicedTo) {
        return '';
    }
    return `${slicedFrom ? getBackwardPath(slicedFrom) : '.'}${slicedTo}`;
};

const removeCommonPart = (a: string, b: string): [string, string] => {
    a = addTrailingSlash(a);
    b = addTrailingSlash(b);
    const maxLength = Math.min(a.length, b.length);
    let startIndex = 0;
    while (startIndex < maxLength && a[startIndex] === b[startIndex]) {
        startIndex += 1;
    }
    const commonDirectoryPathLength = Math.max(
        a.lastIndexOf('/', startIndex - 1),
        0,
    );
    return [
        removeTrailingSlash(a.slice(commonDirectoryPathLength)),
        removeTrailingSlash(b.slice(commonDirectoryPathLength)),
    ];
};
const addTrailingSlash = (input: string) => input.endsWith('/') ? input : `${input}/`;
const removeTrailingSlash = (input: string) => input.endsWith('/') ? input.slice(0, -1) : input;
const getBackwardPath = (input: string) => {
    let index = input.indexOf('/', 0);
    const fragments = [];
    while (0 <= index && index < input.length) {
        fragments.push('..');
        index = input.indexOf('/', index + 1);
    }
    return fragments.join('/') || '../';
};
