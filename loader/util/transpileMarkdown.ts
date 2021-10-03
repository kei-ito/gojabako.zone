import type Markdown from 'mdast';
import type {SerializeMarkdownContext} from '../serialize/MarkdownToJsx';
import {serializeMarkdownRootToJsx} from '../serialize/MarkdownToJsx';
import {listImportDeclarations} from './listImportDeclarations';
import {createSerializeMarkdownContext} from './createSerializeMarkdownContext';

export interface TranspileMarkdownResult extends SerializeMarkdownContext {
    jsx: string,
    imports: string,
    root: Markdown.Root,
}

export const transpileMarkdown = async (
    source: string,
): Promise<TranspileMarkdownResult> => {
    const context = await createSerializeMarkdownContext();
    const root = context.fromMarkdown(source);
    const jsx = [...serializeMarkdownRootToJsx(context, root)].join('');
    const imports = [...listImportDeclarations(context)].join('\n');
    return {...context, jsx, imports, root};
};
