import type Markdown from 'mdast';

export const walkContentNodes = function* (...nodes: Array<Markdown.Content>): Generator<Markdown.Content> {
    for (const node of nodes) {
        yield node;
        if ('children' in node) {
            for (const child of node.children) {
                yield* walkContentNodes(child);
            }
        }
    }
};
