import {serializeMarkdownToJsx} from '../serialize/MarkdownToJsx';
import {listImportDeclarations} from './listImportDeclarations';
import {createSerializeMarkdownContext} from './createSerializeMarkdownContext';

export const transpileMarkdown = async (source: string) => {
    const context = await createSerializeMarkdownContext();
    const jsx = [...serializeMarkdownToJsx(context, source)].join('');
    const imports = [...listImportDeclarations(context)].join('\n');
    return {jsx, imports};
};
