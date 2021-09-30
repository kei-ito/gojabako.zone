/* eslint-disable @nlib/no-globals */
// https://github.com/syntax-tree/mdast
import type * as Markdown from 'mdast-util-from-markdown/lib';
import type {LowlightRoot, LowlightElementSpan, Text} from 'lowlight/lib/core';

interface SerializeContext {
    highlight: (language: string, value: string) => LowlightRoot,
    highlightAuto: (value: string) => LowlightRoot,
    images: Map<string, string>,
}
type Attributes = Record<string, boolean | string | null | undefined>;
type LowlightNode = LowlightElementSpan | LowlightRoot | Text;

export const markdownLoader = async (source: string): Promise<string> => {
    const [{fromMarkdown}, {gfm}, {gfmFromMarkdown}, {lowlight}] = await Promise.all([
        import('mdast-util-from-markdown'),
        import('micromark-extension-gfm'),
        import('mdast-util-gfm'),
        import('lowlight'),
    ]);
    const markdownAst = fromMarkdown(source, {
        extensions: [gfm()],
        mdastExtensions: [gfmFromMarkdown],
    });
    const context: SerializeContext = {
        highlight: lowlight.highlight,
        highlightAuto: lowlight.highlightAuto,
        images: new Map(),
    };
    const jsx = [...serializeMarkdownNodeToJsx(context, markdownAst)].join('');
    return [
        ...serializeSerializeContext(context),
        `export default function Document() {return ${jsx}}`,
    ].join('\n');
};

// eslint-disable-next-line max-lines-per-function, complexity
const serializeMarkdownNodeToJsx = function* (context: SerializeContext, node: Markdown.Node): Generator<string> {
    switch (node.type) {
    case 'root':
        yield* serializeMarkdownNodeToJsxElement(context, '', null, node.children);
        break;
    case 'paragraph':
        yield* serializeMarkdownNodeToJsxElement(context, 'p', null, node.children);
        break;
    case 'heading': {
        const id = sanitize(getTextContent(node).toLowerCase().replace(/\s+/, '_'));
        yield `<h${node.depth}>`;
        yield `<div className="anchor" id="${id}"/>`;
        for (const child of node.children) {
            yield* serializeMarkdownNodeToJsx(context, child);
        }
        yield `&nbsp;<a className="link" href="#${id}">link</a>`;
        yield `</h${node.depth}>`;
        break;
    }
    case 'thematicBreak':
        yield '<hr/>';
        break;
    case 'blockquote':
        yield* serializeMarkdownNodeToJsxElement(context, 'blockquote', null, node.children);
        break;
    case 'list':
        yield* serializeMarkdownNodeToJsxElement(context, node.ordered ? 'ol' : 'ul', null, node.children);
        break;
    case 'listItem':
        if (typeof node.checked === 'boolean') {
            yield '<li data-checkbox="">';
            yield `<input type="checkbox" readOnly={true} checked={${node.checked}}/>`;
        } else {
            yield '<li>';
        }
        for (const child of node.children) {
            yield* serializeMarkdownNodeToJsx(context, child);
        }
        yield '</li>';
        break;
    case 'table': {
        yield '<table>';
        const aligns = node.align || [];
        let rowIndex = 0;
        for (const row of node.children) {
            const tag = rowIndex === 0 ? 'th' : 'td';
            yield '<tr>';
            let columnIndex = 0;
            for (const cell of row.children) {
                const align = aligns[columnIndex] || '';
                yield* serializeMarkdownNodeToJsxElement(context, tag, {align}, cell.children);
                columnIndex += 1;
            }
            yield '</tr>';
            rowIndex += 1;
        }
        yield '</table>';
        break;
    }
    case 'tableRow':
        throw unsupportedError(node);
    case 'tableCell':
        throw unsupportedError(node);
    case 'html':
        throw unsupportedError(node);
    case 'code':
        if (node.lang) {
            yield* serializeLowlightNodeToJsx(context.highlight(node.lang, node.value));
        } else {
            yield* serializeLowlightNodeToJsx(context.highlightAuto(node.value));
        }
        break;
    case 'yaml':
        throw unsupportedError(node);
    case 'definition':
        if (node.label) {
            yield '<a';
            yield* serializeAttrs({href: node.url, title: node.title});
            yield `>${node.label}</a>`;
        }
        break;
    case 'footnoteDefinition':
        throw unsupportedError(node);
    case 'text':
        yield sanitize(node.value);
        break;
    case 'emphasis':
        yield* serializeMarkdownNodeToJsxElement(context, 'i', null, node.children);
        break;
    case 'strong':
        yield* serializeMarkdownNodeToJsxElement(context, 'b', null, node.children);
        break;
    case 'delete':
        yield* serializeMarkdownNodeToJsxElement(context, 's', null, node.children);
        break;
    case 'inlineCode':
        yield `<code>${sanitize(node.value)}</code>`;
        break;
    case 'break':
        throw unsupportedError(node);
    case 'link':
        yield* serializeMarkdownNodeToJsxElement(
            context,
            'a',
            {href: node.url, title: node.title},
            node.children,
        );
        break;
    case 'image': {
        const localName = `image${context.images.size}`;
        context.images.set(localName, node.url);
        yield `<Image src={${localName}} alt="${node.alt}" placeholder="blur"/>`;
        break;
    }
    case 'linkReference':
        break;
    case 'imageReference':
        break;
    case 'footnote':
        throw unsupportedError(node);
    case 'footnoteReference':
        throw unsupportedError(node);
    default:
        throw unsupportedError(node);
    }
};
const toCharacterReference = (codePoint: number) => `&#${codePoint};`;
const sanitize = (value: string) => value.replace(/[{}<>\\]/g, (c) => {
    const codePoint = c.codePointAt(0);
    return codePoint ? toCharacterReference(codePoint) : c;
});
const getTextContent = (node: Markdown.Node): string => {
    if ('value' in node) {
        return node.value;
    }
    if ('children' in node) {
        return node.children.map((child) => getTextContent(child)).join('');
    }
    return '';
};
const unsupportedError = (node: LowlightNode | Markdown.Node) => new Error(
    `UnsupportedNodeType: ${JSON.stringify(node, null, 2)}`,
);
const serializeAttrs = function* (
    attrs: Attributes | null,
): Generator<string> {
    if (attrs) {
        for (const [key, value] of Object.entries(attrs)) {
            if (value === true) {
                yield ` ${key}=""`;
            } else if (value) {
                yield ` ${key}="${sanitize(value)}"`;
            }
        }
    }
};
const serializeMarkdownNodeToJsxElement = function* (
    context: SerializeContext,
    tag: string,
    attrs: Attributes | null,
    children: Array<Markdown.Node>,
): Generator<string> {
    yield `<${tag}`;
    yield* serializeAttrs(attrs);
    yield '>';
    for (const node of children) {
        yield* serializeMarkdownNodeToJsx(context, node);
    }
    yield `</${tag}>`;
};
const serializeLowlightNodeToJsx = function* (node: LowlightNode): Generator<string> {
    switch (node.type) {
    case 'text':
        yield sanitize(node.value).replace(/\n/g, '</code></li><li><code>');
        break;
    case 'element': {
        const {tagName, properties} = node;
        yield `<${tagName} `;
        for (const [name, values] of Object.entries(properties)) {
            yield `${name}="${values.join(' ')}"`;
        }
        yield '>';
        for (const child of node.children) {
            yield* serializeLowlightNodeToJsx(child);
        }
        yield `</${tagName}>`;
        break;
    }
    case 'root':
        yield `<ol data-lang="${node.data.language}"><li><code>`;
        for (const child of node.children) {
            yield* serializeLowlightNodeToJsx(child);
        }
        yield '</code></li></ol>';
        break;
    default:
        throw unsupportedError(node);
    }
};
const serializeSerializeContext = function* ({images}: SerializeContext) {
    if (0 < images.size) {
        yield 'import Image from \'next/image\';';
        for (const [localName, from] of images) {
            yield `import ${localName} from '${from}';`;
        }
    }
};
