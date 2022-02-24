import type {SerializeMarkdownContext} from './serializeMarkdownToJsx';
import {serializeFootnotes} from './serializeMarkdownToJsx';
import {getCompoentPath} from '../fs/getComponentPath';

export const finalizeSerializeMarkdownContext = (context: SerializeMarkdownContext, fileAbsolutePath: string) => {
    const foot = [...serializeFootnotes(context)].join('');
    const head = [...serializeHead(context, fileAbsolutePath)].join('\n');
    return {head, foot};
};

const serializeHead = function* (
    {links, images, components, head}: SerializeMarkdownContext,
    fileAbsolutePath: string,
): Generator<string> {
    for (const href of links) {
        if (href.startsWith('/') || href.startsWith('.')) {
            yield 'import Link from \'next/link\';';
            break;
        }
    }
    for (const [localName, from] of images) {
        yield `import ${localName} from '${from}.component';`;
    }
    for (const component of components) {
        yield `import {${component.split('/').pop()}} from '${getCompoentPath(fileAbsolutePath, component)}';`;
    }
    for (const line of head) {
        yield line;
    }
};
