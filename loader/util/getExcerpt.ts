import type * as Markdown from 'mdast';
import {getTextContent} from '../serialize/TextContent';
import {walkContentNodes} from './walkContentNodes';

export const getExcerpt = (
    root: Markdown.Root,
    maxLength: number,
): string => {
    let result = '';
    for (const node of walkContentNodes(...root.children)) {
        if (node.type === 'paragraph') {
            result += getTextContent(node);
            if (maxLength < result.length) {
                return `${result.slice(0, maxLength - 3)}...`;
            }
        }
    }
    return result;
};
