// eslint-disable-next-line @typescript-eslint/ban-types
type Node = {type: string, children: Iterable<Node>} | {type: string, value: string} | {type: string};

export const serializeTextContent = function* (node: Node): Generator<string> {
    if (node.type === 'text' && 'value' in node) {
        yield node.value;
    }
    if ('children' in node) {
        for (const child of node.children) {
            yield* serializeTextContent(child);
        }
    }
};

export const getTextContent = (
    input: Node,
) => [...serializeTextContent(input)].join('');
