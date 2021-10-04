import type Markdown from 'mdast';
import type {MarkdownContent, SerializeMarkdownContext} from '../serialize/MarkdownToJsx';
import {removeHtmlComments} from './removeHtmlComments';
import {walkContentNodes} from './walkContentNodes';

export const createSerializeMarkdownContext = async (): Promise<SerializeMarkdownContext> => {
    const [{fromMarkdown}, {gfm}, {footnote}, {gfmFromMarkdown}, {footnoteFromMarkdown}, {lowlight}] = await Promise.all([
        import('mdast-util-from-markdown'),
        import('micromark-extension-gfm'),
        import('micromark-extension-footnote'),
        import('mdast-util-gfm'),
        import('mdast-util-footnote'),
        import('lowlight'),
    ]);
    let nodes: Map<Markdown.Content['type'], Array<Markdown.Content> | undefined> | null = null;
    const nodeListOf = <T extends Markdown.Content['type']>(type: T): Array<MarkdownContent<T>> => {
        if (!nodes) {
            throw new Error('This context has never parsed a markdown.');
        }
        return (nodes.get(type) || []).slice() as Array<MarkdownContent<T>>;
    };
    const findDefinition = (id: string): Markdown.Definition | null => nodeListOf('definition').find(({identifier}) => identifier === id) || null;
    return {
        fromMarkdown: (source: string) => {
            const root = fromMarkdown(removeHtmlComments(source), {
                extensions: [gfm(), footnote()],
                mdastExtensions: [gfmFromMarkdown, footnoteFromMarkdown],
            });
            if (!nodes) {
                nodes = new Map();
            }
            for (const node of walkContentNodes(...root.children)) {
                let list = nodes.get(node.type);
                if (!list) {
                    list = [];
                    nodes.set(node.type, list);
                }
                list.push(node);
            }
            return root;
        },
        ...lowlight,
        head: new Set(),
        images: new Map(),
        nodeListOf,
        findDefinition,
    };
};
