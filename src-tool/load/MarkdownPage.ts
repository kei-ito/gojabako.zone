import {serializeMarkdownRootToJsx} from '../serialize/MarkdownToJsx';
import {toJsxSafeString} from '../serialize/StringToJsxSafeString';
import {getTextContent} from '../serialize/TextContent';
import {createSerializeMarkdownContext} from '../util/createSerializeMarkdownContext';
import {finalizeSerializeMarkdownContext} from '../util/finalizeSerializeMarkdownContext';
import {getExcerpt} from '../util/getExcerpt';
import {getPathName} from '../util/getPathName';
import type {LoaderThis} from '../util/LoaderThis';

export const loadMarkdownPage = async (
    loaderThis: LoaderThis,
    source: string,
) => {
    await Promise.resolve();
    const context = createSerializeMarkdownContext();
    const root = context.parseMarkdown(source);
    const [titleNode, ...bodyNodes] = root.children;
    if (!(titleNode.type === 'heading' && titleNode.depth === 1)) {
        throw new Error(`The 1st node is not <h1>: ${JSON.stringify(titleNode, null, 4)}`);
    }
    context.components.add('PageHead');
    context.components.add('PageDate');
    const title = getTextContent(titleNode);
    const excerpt = getExcerpt(200, ...bodyNodes);
    root.children = [titleNode];
    const titleJsx = [...serializeMarkdownRootToJsx(context, root)].join('');
    root.children = bodyNodes;
    const body = [...serializeMarkdownRootToJsx(context, root)].join('');
    const pageFileUrl = new URL(`file://${loaderThis.resourcePath}`);
    const pathname = getPathName(pageFileUrl);
    const {head, foot} = finalizeSerializeMarkdownContext(context, pageFileUrl);
    return `${head}
export default function MarkdownPage() {
    return <>
        <PageHead
            title="${toJsxSafeString(title)}"
            description="${toJsxSafeString(excerpt)}"
            pathname="${pathname}"
        />
        <main>
            <article>
                <header>
                    ${titleJsx}
                    <PageDate pathname="${pathname}"/>
                </header>
                ${body.replace(/(<\w+)/g, '\n$1')}
                ${foot}
            </article>
        </main>
    </>;
}`;
};
