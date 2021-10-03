import {serializeFootnotes, serializeMarkdownRootToJsx} from '../serialize/MarkdownToJsx';
import {toSafeString} from '../serialize/StringToJsxSafeString';
import {getTextContent} from '../serialize/TextContent';
import {createSerializeMarkdownContext} from '../util/createSerializeMarkdownContext';
import {getExcerpt} from '../util/getExcerpt';
import type {FileData} from '../util/getFileData';
import {getFileData} from '../util/getFileData';
import {getSiteData} from '../util/getSiteData';
import {listImportDeclarations} from '../util/listImportDeclarations';
import type {LoaderThis} from '../util/LoaderContext';
import {LoaderContext} from '../util/LoaderContext';

export const loadMarkdownPage = async (
    loaderThis: LoaderThis,
    source: string,
) => {
    const context = await createSerializeMarkdownContext();
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
    const loaderContext = new LoaderContext(loaderThis, '.page.md');
    const imports = [...listImportDeclarations(context)].join('\n');
    const footnote = [...serializeFootnotes(context)].join('');
    const fileData = await getFileData(loaderContext.filePath);
    return `
import Head from 'next/head';
import {Page} from '${loaderContext.getRelativePath('src/components/Page')}';
import {ArticleHeader} from '${loaderContext.getRelativePath('src/components/ArticleHeader')}';
${imports}
export default function MarkdownPage() {
    return <Page
        title="${toSafeString(title)}"
        description="${toSafeString(excerpt)}"
        url="${loaderContext.url}"
        author="${toSafeString(getSiteData().author.name)}"
    >
        <ArticleHeader${[...serializeDateAttributes(fileData)].join('')}>
            ${titleJsx}
        </ArticleHeader>
        <section>
            ${body}
        </section>
        ${footnote}
    </Page>;
}`.trim();
};

const serializeDateAttributes = function* (
    {filePath, firstCommitAt, lastCommitAt}: FileData,
): Generator<string> {
    yield ` filePath="${filePath}"`;
    if (firstCommitAt) {
        yield ` publishedAt={new Date('${firstCommitAt.toISOString()}')}`;
    }
    if (lastCommitAt) {
        yield ` updatedAt={new Date('${lastCommitAt.toISOString()}')}`;
    }
};
