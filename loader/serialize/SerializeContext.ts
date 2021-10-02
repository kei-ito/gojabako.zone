import type {SerializeMarkdownContext} from './MarkdownToJsx';

export const serializeSerializeContext = function* (
    {images}: SerializeMarkdownContext,
): Generator<string> {
    if (0 < images.size) {
        yield 'import Image from \'next/image\';';
        for (const [localName, from] of images) {
            yield `import ${localName} from '${from}';`;
        }
    }
};
