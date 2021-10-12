import type Markdown from 'mdast';
import {footnoteFromMarkdown} from 'mdast-util-footnote';
import {fromMarkdown} from 'mdast-util-from-markdown';
import {gfmFromMarkdown} from 'mdast-util-gfm';
import {footnote} from 'micromark-extension-footnote';
import {gfm} from 'micromark-extension-gfm';
import type {MarkdownContent, SerializeMarkdownContext} from '../serialize/MarkdownToJsx';
import {removeHtmlComments} from './removeHtmlComments';
import {walkContentNodes} from './walkContentNodes';

export const createSerializeMarkdownContext = (): SerializeMarkdownContext => {
    const nodes = new Map<Markdown.Content['type'], Array<Markdown.Content> | undefined>();
    const nodeListOf = <T extends Markdown.Content['type']>(type: T): Array<MarkdownContent<T>> => {
        return (nodes.get(type) || []).slice() as Array<MarkdownContent<T>>;
    };
    return {
        parseMarkdown: (source: string) => {
            const root = fromMarkdown(removeHtmlComments(source), {
                extensions: [gfm(), footnote()],
                mdastExtensions: [gfmFromMarkdown(), footnoteFromMarkdown],
            });
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
        findDefinition: (id: string): Markdown.Definition | null => nodeListOf('definition').find(({identifier}) => identifier === id) || null,
        nodeListOf,
        head: new Set(),
        links: new Set(),
        components: new Set(),
        images: new Map(),
    };
};
