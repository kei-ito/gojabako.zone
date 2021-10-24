import {serializeMarkdownRootToJsx} from '../markdown/serializeToJsx';
import {createSerializeMarkdownContext} from '../markdown/createSerializeContext';
import {finalizeSerializeMarkdownContext} from '../markdown/finalizeSerializeContext';
import {Promise, URL} from '../es/global';
import type {LoaderThis} from './type';

const loadMarkdownModule = async function (
    this: LoaderThis,
    source: string,
) {
    await Promise.resolve();
    const pageFileUrl = new URL(`file://${this.resourcePath}`);
    const context = createSerializeMarkdownContext();
    const root = context.parseMarkdown(source);
    const jsx = [...serializeMarkdownRootToJsx(context, root)].join('');
    const {head, foot} = finalizeSerializeMarkdownContext(context, pageFileUrl);
    return [
        head,
        `export default function Document() {return <>${jsx}${foot}</>}`,
    ].join('\n');
};

export default loadMarkdownModule;
