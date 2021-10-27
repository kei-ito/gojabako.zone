import {Error, JSON, Promise} from '../es/global';
import {getTextContent} from '../es/TextContent';
import {toJsxSafeString} from '../es/toJsxSafeString';
import {createSerializeMarkdownContext} from '../markdown/createSerializeContext';
import {finalizeSerializeMarkdownContext} from '../markdown/finalizeSerializeContext';
import {getMarkdownExcerpt} from '../markdown/getExcerpt';
import {serializeMarkdownRootToJsx} from '../markdown/serializeToJsx';
import {getPagePathName} from '../node/getPagePathName';
import type {LoaderThis} from './type';

export const loadMarkdownPage = async (
    {resourcePath}: LoaderThis,
    source: string,
): Promise<string> => {
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
    root.children = [titleNode];
    const titleJsx = [...serializeMarkdownRootToJsx(context, root)].join('');
    root.children = bodyNodes;
    const body = [...serializeMarkdownRootToJsx(context, root)].join('');
    const pathname = getPagePathName(resourcePath);
    const {head, foot} = finalizeSerializeMarkdownContext(context, resourcePath);
    const excerpt = getMarkdownExcerpt(200, ...bodyNodes);
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
