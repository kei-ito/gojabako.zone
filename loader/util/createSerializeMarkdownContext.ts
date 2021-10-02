import type {SerializeMarkdownContext} from '../serialize/MarkdownToJsx';

export const createSerializeMarkdownContext = async (): Promise<SerializeMarkdownContext> => {
    const [{fromMarkdown}, {gfm}, {footnote}, {gfmFromMarkdown}, {footnoteFromMarkdown}, {lowlight}] = await Promise.all([
        import('mdast-util-from-markdown'),
        import('micromark-extension-gfm'),
        import('micromark-extension-footnote'),
        import('mdast-util-gfm'),
        import('mdast-util-footnote'),
        import('lowlight'),
    ]);
    return {
        fromMarkdown: (source: string) => fromMarkdown(source, {
            extensions: [gfm(), footnote()],
            mdastExtensions: [gfmFromMarkdown, footnoteFromMarkdown],
        }),
        ...lowlight,
        images: new Map(),
        definitions: new Map(),
        footnotes: new Map(),
    };
};
