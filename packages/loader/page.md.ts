import {Error, JSON, Promise} from '../es/global';
import {createSerializeMarkdownContext} from '../markdown/createSerializeContext';
import {finalizeSerializeMarkdownContext} from '../markdown/finalizeSerializeContext';
import {getMarkdownExcerpt} from '../markdown/getExcerpt';
import {serializeMarkdownRootToJsx} from '../markdown/serializeMarkdownToJsx';
import {getPagePathName} from '../page/getPagePathName';
import {createLinkResolver} from './createLinkResolver';
import type {LoaderThis} from './type';

export const loadMarkdownPage = async (
    {resourcePath}: LoaderThis,
    source: string,
): Promise<string> => {
    await Promise.resolve();
    const context = createSerializeMarkdownContext({
        transformLink: createLinkResolver(resourcePath),
    });
    const root = context.parseMarkdown(source);
    const [titleNode, ...bodyNodes] = root.children;
    if (!(titleNode.type === 'heading' && titleNode.depth === 1)) {
        throw new Error(`The 1st node is not <h1>: ${JSON.stringify(titleNode, null, 4)}`);
    }
    root.children = bodyNodes;
    context.components.add('site/HtmlHead');
    context.components.add('site/PageTitle');
    const body = [...serializeMarkdownRootToJsx(context, root)].join('');
    const pathname = getPagePathName(resourcePath);
    const {head, foot} = finalizeSerializeMarkdownContext(context, resourcePath);
    const excerpt = getMarkdownExcerpt(200, ...bodyNodes);
    return `${head}
export default function MarkdownPage() {
    return <>
        <HtmlHead description=${JSON.stringify(excerpt)} pathname="${pathname}"/>
        <main>
            <article>
                <PageTitle pathname="${pathname}"/>
                ${body}
                ${foot}
            </article>
        </main>
    </>;
}`;
};
