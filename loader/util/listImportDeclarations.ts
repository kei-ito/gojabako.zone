import type {SerializeMarkdownContext} from '../serialize/MarkdownToJsx';

export const listImportDeclarations = function* (
    {images, links}: SerializeMarkdownContext,
): Generator<string> {
    for (const href of links) {
        if (href.startsWith('/')) {
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
};
