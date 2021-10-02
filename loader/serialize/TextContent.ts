// eslint-disable-next-line @typescript-eslint/ban-types
type Node = {} | {children: Iterable<Node>} | {value: string};

export const serializeTextContent = function* (input: Node): Generator<string> {
    if ('value' in input) {
        yield input.value;
    }
    if ('children' in input) {
        for (const child of input.children) {
            yield* serializeTextContent(child);
        }
    }
};

export const getTextContent = (input: Node) => [...serializeTextContent(input)].join('');
