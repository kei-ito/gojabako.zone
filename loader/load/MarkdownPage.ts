import {toSafeString} from '../serialize/StringToJsxSafeString';
import {getTextContent} from '../serialize/TextContent';
import {getExcerpt} from '../util/getExcerpt';
import {getSiteData} from '../util/getSiteData';
import type {LoaderThis} from '../util/LoaderContext';
import {LoaderContext} from '../util/LoaderContext';
import type {TranspileMarkdownResult} from '../util/transpileMarkdown';
import {transpileMarkdown} from '../util/transpileMarkdown';

const getCode = (
    ctx: LoaderContext,
    result: TranspileMarkdownResult,
) => `
import Head from 'next/head';
import {Page} from '${ctx.getRelativePath('src/components/Page')}';
${result.imports}
export default function MarkdownPage() {
    return <Page
        title="${toSafeString(getTextContent(result.nodeListOf('heading')[0]))}"
        description="${toSafeString(getExcerpt(result.root, 200))}"
        url="${ctx.url}"
        author="${toSafeString(getSiteData().author.name)}"
    >
        ${result.jsx}
    </Page>;
}
`.trim();

export const loadMarkdownPage = async (
    loaderThis: LoaderThis,
    source: string,
) => {
    const ctx = new LoaderContext(loaderThis, '.page.md');
    const result = await transpileMarkdown(source);
    return getCode(ctx, result);
};
