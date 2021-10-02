import type Markdown from 'mdast';

export const walkNodes = function* (
    node: Markdown.Content | Markdown.Root,
): Generator<Markdown.Content | Markdown.Root> {
    yield node;
    if ('children' in node) {
        for (const child of node.children) {
            yield* walkNodes(child);
        }
    }
};
