import type {SerializeMarkdownContext} from '../serialize/MarkdownToJsx';
import {serializeFootnotes} from '../serialize/MarkdownToJsx';
import {getCompoentPath} from './getComponentPath';

export const finalizeSerializeMarkdownContext = (
    context: SerializeMarkdownContext,
    fileUrl: URL,
) => {
    const foot = [...serializeFootnotes(context)].join('');
    const head = [...serializeHead(context, fileUrl)].join('\n');
    return {head, foot};
};

const serializeHead = function* (
    {links, images, components, head}: SerializeMarkdownContext,
    fileUrl: URL,
): Generator<string> {
    for (const href of links) {
        if (href.startsWith('/') || href.startsWith('.')) {
            yield 'import Link from \'next/link\';';
            break;
        }
    }
    if (0 < images.size) {
        yield 'import Image from \'next/image\';';
        for (const [localName, from] of images) {
            yield `import ${localName} from '${from}';`;
        }
    }
    for (const component of components) {
        yield `import {${component}} from '${getCompoentPath(fileUrl, component)}';`;
    }
    for (const line of head) {
        yield line;
    }
};
