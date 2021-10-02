import type {SerializeMarkdownContext} from '../serialize/MarkdownToJsx';

export const createSerializeMarkdownContext = async (): Promise<SerializeMarkdownContext> => {
    const [{fromMarkdown}, {gfm}, {gfmFromMarkdown}, {lowlight}] = await Promise.all([
        import('mdast-util-from-markdown'),
        import('micromark-extension-gfm'),
        import('mdast-util-gfm'),
        import('lowlight'),
    ]);
    return {
        fromMarkdown: (source: string) => fromMarkdown(source, {
            extensions: [gfm()],
            mdastExtensions: [gfmFromMarkdown],
        }),
        ...lowlight,
        images: new Map(),
    };
};
