import {serializeFootnotes, serializeMarkdownRootToJsx} from '../serialize/MarkdownToJsx';
import {toJsxSafeString} from '../serialize/StringToJsxSafeString';
import {getTextContent} from '../serialize/TextContent';
import {createSerializeMarkdownContext} from '../util/createSerializeMarkdownContext';
import {getExcerpt} from '../util/getExcerpt';
import {getPageData} from '../util/getPageData';
import {getRelativePath} from '../util/getRelativePath';
import {listImportDeclarations} from '../util/listImportDeclarations';
import type {LoaderThis} from '../util/LoaderThis';
import {componentsUrl} from '../util/url';

// eslint-disable-next-line max-lines-per-function
export const loadMarkdownPage = async (
    loaderThis: LoaderThis,
    source: string,
) => {
    const context = createSerializeMarkdownContext();
    const root = context.fromMarkdown(source);
    const [titleNode, ...bodyNodes] = root.children;
    if (!(titleNode.type === 'heading' && titleNode.depth === 1)) {
        throw new Error(`The 1st node is not <h1>: ${JSON.stringify(titleNode, null, 4)}`);
    }
    const title = getTextContent(titleNode);
    const excerpt = getExcerpt(200, ...bodyNodes);
    root.children = [titleNode];
    const titleJsx = [...serializeMarkdownRootToJsx(context, root)].join('');
    root.children = bodyNodes;
    const body = [...serializeMarkdownRootToJsx(context, root)].join('');
    let headIsRequired = false;
    headIsRequired ||= 0 < context.scripts.size;
    const imports = [
        ...listImportDeclarations(context),
        ...context.head,
    ];
    if (headIsRequired) {
        imports.unshift('import Head from \'next/head\';');
    }
    const footnote = [...serializeFootnotes(context)].join('');
    const pageFileUrl = new URL(`file://${loaderThis.resourcePath}`);
    const page = await getPageData(pageFileUrl);
    return `
import {PageHead} from '${getCompoentPath(pageFileUrl, 'PageHead')}';
import {ArticleHeader} from '${getCompoentPath(pageFileUrl, 'ArticleHeader')}';
${imports.join('\n')}
export default function MarkdownPage() {
    return <>
        ${headIsRequired ? '<Head>' : ''}
        ${[...context.scripts].map((src) => `<script src="${src}" async=""/>`).join('')}
        ${headIsRequired ? '</Head>' : ''}
        <PageHead
            title="${toJsxSafeString(title)}"
            description="${toJsxSafeString(excerpt)}"
            pathname="${page.pathname}"
        />
        <main>
            <article>
                <ArticleHeader${[...serializeDateAttributes(page)].join('')}>
                    ${titleJsx}
                </ArticleHeader>
                ${body}
                ${footnote}
            </article>
        </main>
    </>;
}`.trim();
};

const serializeDateAttributes = function* (
    {filePath, publishedAt, updatedAt}: {
        filePath: string,
        publishedAt: string,
        updatedAt: string,
    },
): Generator<string> {
    yield ` filePath="${filePath}"`;
    if (publishedAt) {
        yield ` publishedAt="${publishedAt}"`;
    }
    if (updatedAt) {
        yield ` updatedAt="${updatedAt}"`;
    }
};

const getCompoentPath = (pageUrl: URL, componentName: string) => {
    const componentUrl = new URL(`${componentName}/index.tsx`, componentsUrl);
    let pageDir = pageUrl.pathname;
    pageDir = pageDir.slice(0, Math.max(0, pageDir.lastIndexOf('/')));
    return getRelativePath(pageDir, componentUrl.pathname);
};
