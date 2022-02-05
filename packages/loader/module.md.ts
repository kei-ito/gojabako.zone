import {Promise} from '../es/global';
import {createSerializeMarkdownContext} from '../markdown/createSerializeContext';
import {finalizeSerializeMarkdownContext} from '../markdown/finalizeSerializeContext';
import {serializeMarkdownRootToJsx} from '../markdown/serializeMarkdownToJsx';
import {createLinkResolver} from './createLinkResolver';
import type {LoaderThis} from './type';

export const loadMarkdownModule = async (
    {resourcePath}: LoaderThis,
    source: string,
): Promise<string> => {
    await Promise.resolve();
    const context = createSerializeMarkdownContext({
        transformLink: createLinkResolver(resourcePath),
    });
    const root = context.parseMarkdown(source);
    const jsx = [...serializeMarkdownRootToJsx(context, root)].join('');
    const {head, foot} = finalizeSerializeMarkdownContext(context, resourcePath);
    return [
        head,
        `export default function Document() {return <>${jsx}${foot}</>}`,
    ].join('\n');
};
