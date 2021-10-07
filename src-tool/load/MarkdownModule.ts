import {serializeMarkdownRootToJsx} from '../serialize/MarkdownToJsx';
import {createSerializeMarkdownContext} from '../util/createSerializeMarkdownContext';
import {listImportDeclarations} from '../util/listImportDeclarations';
import type {LoaderThis} from '../util/LoaderThis';

export const loadMarkdownModule = async (
    _loaderThis: LoaderThis,
    source: string,
) => {
    await Promise.resolve();
    const context = createSerializeMarkdownContext();
    const root = context.fromMarkdown(source);
    const jsx = [...serializeMarkdownRootToJsx(context, root)].join('');
    const imports = [...listImportDeclarations(context)].join('\n');
    return [
        imports,
        `export default function Document() {return ${jsx}}`,
    ].join('\n');
};
