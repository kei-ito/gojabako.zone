import {serializeMarkdownRootToJsx} from '../serialize/MarkdownToJsx';
import {createSerializeMarkdownContext} from '../util/createSerializeMarkdownContext';
import {finalizeSerializeMarkdownContext} from '../util/finalizeSerializeMarkdownContext';
import type {LoaderThis} from '../util/LoaderThis';

export const loadMarkdownModule = async (
    loaderThis: LoaderThis,
    source: string,
) => {
    await Promise.resolve();
    const pageFileUrl = new URL(`file://${loaderThis.resourcePath}`);
    const context = createSerializeMarkdownContext();
    const root = context.fromMarkdown(source);
    const jsx = [...serializeMarkdownRootToJsx(context, root)].join('');
    const {head, foot} = finalizeSerializeMarkdownContext(context, pageFileUrl);
    return [
        head,
        `export default function Document() {return <>${jsx}${foot}</>}`,
    ].join('\n');
};
