import * as fs from 'fs';
import {fromMarkdown} from 'mdast-util-from-markdown';
import {getExtension} from '../es/getExtension';
import {Error} from '../es/global';
import {getTextContent} from '../es/TextContent';
import {walkMarkdownContentNodes} from '../markdown/walkContentNodes';
import {getPagePathName} from './getPagePathName';

export const getPageTitle = async (
    pageFileAbsolutePath: string,
): Promise<string> => {
    if (getPagePathName(pageFileAbsolutePath) === '/') {
        return 'トップページ';
    }
    const code = await fs.promises.readFile(pageFileAbsolutePath, 'utf8');
    const ext = getExtension(pageFileAbsolutePath);
    switch (ext) {
    case '.md':
        return getTitleFromMarkdown(code);
    case '.tsx':
        return getTitleFromJsx(code);
    default:
        throw new Error(`UnsupportedFile: ${pageFileAbsolutePath}`);
    }
};

const getTitleFromMarkdown = (code: string): string => {
    for (const node of walkMarkdownContentNodes(...fromMarkdown(code).children)) {
        if (node.type === 'heading' && node.depth === 1) {
            return getTextContent(node);
        }
    }
    return '';
};

const getTitleFromJsx = (code: string): string => {
    const titleTag = (/<title[^>]*?>([^<]*?)<\/title[^>]*?>/).exec(code);
    if (titleTag) {
        return titleTag[1];
    }
    return '';
};
