import * as fs from 'fs';
import {fromMarkdown} from 'mdast-util-from-markdown';
import {getTextContent} from '../es/TextContent';
import {walkMarkdownContentNodes} from '../markdown/walkContentNodes';
import {getExtension} from '../es/getExtension';
import {Error} from '../es/global';

export const getPageTitle = async (
    pathname: string,
    fileUrl: URL,
): Promise<string> => {
    if (pathname === '/') {
        return 'トップページ';
    }
    const code = await fs.promises.readFile(fileUrl, 'utf8');
    const ext = getExtension(fileUrl.pathname);
    switch (ext) {
    case '.md':
        return getTitleFromMarkdown(code);
    case '.tsx':
        return getTitleFromJsx(code);
    default:
        throw new Error(`UnsupportedFile: ${fileUrl.pathname}`);
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
