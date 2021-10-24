import type * as Markdown from 'mdast';
import {getTextContent} from '../es/TextContent';
import {walkMarkdownContentNodes} from './walkContentNodes';

export const getMarkdownExcerpt = (maxLength: number, ...nodes: Array<Markdown.Content>): string => {
    let result = '';
    for (const node of walkMarkdownContentNodes(...nodes)) {
        if (node.type === 'paragraph') {
            result += getTextContent(node);
            if (maxLength < result.length) {
                return `${result.slice(0, maxLength - 3)}...`;
            }
        }
    }
    return result;
};
