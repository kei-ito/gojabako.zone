import {serializeMarkdownRootToJsx} from '../serialize/MarkdownToJsx';
import {toJsxSafeString} from '../serialize/StringToJsxSafeString';
import {getTextContent} from '../serialize/TextContent';
import {createSerializeMarkdownContext} from '../util/createSerializeMarkdownContext';
import {finalizeSerializeMarkdownContext} from '../util/finalizeSerializeMarkdownContext';
import {getExcerpt} from '../util/getExcerpt';
import {getPageData} from '../util/getPageData';
import type {LoaderThis} from '../util/LoaderThis';

// eslint-disable-next-line max-lines-per-function
export const loadMarkdownPage = async (
    loaderThis: LoaderThis,
    source: string,
) => {
    const pageFileUrl = new URL(`file://${loaderThis.resourcePath}`);
    const context = createSerializeMarkdownContext();
    context.components.add('PageHead');
    context.components.add('ArticleHeader');
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
    const page = await getPageData(pageFileUrl);
    const {head, foot} = finalizeSerializeMarkdownContext(context, pageFileUrl);
    return `${head}
export default function MarkdownPage() {
    return <>
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
                ${foot}
            </article>
        </main>
    </>;
}`;
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
