import type Markdown from 'mdast';
import {fromMarkdown} from 'mdast-util-from-markdown';
import {gfm} from 'micromark-extension-gfm';
import {footnote} from 'micromark-extension-footnote';
import {gfmFromMarkdown} from 'mdast-util-gfm';
import {footnoteFromMarkdown} from 'mdast-util-footnote';
import {createCounter} from '../es/createCounter';
import {Map, Set} from '../es/global';
import {removeHtmlComments} from '../es/removeHtmlComments';
import type {MarkdownContent, SerializeMarkdownContext} from './serializeMarkdownToJsx';
import {walkMarkdownContentNodes} from './walkContentNodes';
import {wrapKatexBlocks} from './wrapKatexBlocks';

export const createSerializeMarkdownContext = (
    options: Pick<SerializeMarkdownContext, 'transformLink'> = {},
): SerializeMarkdownContext => {
    const nodes = new Map<Markdown.Content['type'], Array<Markdown.Content> | undefined>();
    const nodeListOf = <T extends Markdown.Content['type']>(type: T) => (nodes.get(type) || []).slice() as Array<MarkdownContent<T>>;
    const counters = new Map<string, () => number>();
    return {
        ...options,
        getId: (namespace: string): number => {
            let counter = counters.get(namespace);
            if (!counter) {
                counter = createCounter();
                counters.set(namespace, counter);
            }
            return counter();
        },
        parseMarkdown: (source: string) => {
            let filtered = source;
            filtered = removeHtmlComments(filtered);
            filtered = wrapKatexBlocks(filtered);
            const root = fromMarkdown(filtered, {
                extensions: [gfm(), footnote()],
                mdastExtensions: [gfmFromMarkdown(), footnoteFromMarkdown],
            });
            for (const node of walkMarkdownContentNodes(...root.children)) {
                let list = nodes.get(node.type);
                if (!list) {
                    list = [];
                    nodes.set(node.type, list);
                }
                list.push(node);
            }
            return root;
        },
        findDefinition: (id: string): Markdown.Definition | null => nodeListOf('definition').find(({identifier}) => identifier === id) || null,
        nodeListOf,
        head: new Set(),
        links: new Set(),
        components: new Set(),
        images: new Map(),
    };
};
