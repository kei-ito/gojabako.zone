// https://github.com/syntax-tree/mdast
import type Markdown from 'mdast';
import type {LowlightRoot} from 'lowlight/lib/core';
import {getTextContent} from './TextContent';
import {serializeStringToJsxSafeString, toSafeString} from './StringToJsxSafeString';
import {createUnsupportedTypeError} from '../util/createUnsupportedTypeError';
import {serializeLowlightToJsx} from './LowlightToJsx';
import type {Attributes} from './Attributes';
import {serializeAttributes} from './Attributes';

export interface SerializeMarkdownContext {
    fromMarkdown: (source: string) => Markdown.Root,
    highlight: (language: string, value: string) => LowlightRoot,
    highlightAuto: (value: string) => LowlightRoot,
    images: Map<string, string>,
}

export const serializeMarkdownToJsx = function* (
    context: SerializeMarkdownContext,
    source: string,
) {
    yield* serialize(context, context.fromMarkdown(source));
};

// eslint-disable-next-line max-lines-per-function, complexity
const serialize = function* (
    context: SerializeMarkdownContext,
    node: Markdown.Content | Markdown.Root,
): Generator<string> {
    switch (node.type) {
    case 'root':
        yield* serializeToElement(context, '', null, node.children);
        break;
    case 'paragraph': {
        const {children} = node;
        if (children.every(({type}) => type === 'image')) {
            for (const child of children) {
                yield* serialize(context, child);
            }
        } else {
            yield* serializeToElement(context, 'p', null, children);
        }
        break;
    }
    case 'heading': {
        const id = toSafeString(getTextContent(node).toLowerCase().replace(/\s+/, '_'));
        yield `<h${node.depth}>`;
        if (1 < node.depth) {
            yield `<div className="anchor" id="${id}"/>`;
        }
        for (const child of node.children) {
            yield* serialize(context, child);
        }
        if (1 < node.depth) {
            yield `&nbsp;<a className="link" href="#${id}" title="#${id}">#link</a>`;
        }
        yield `</h${node.depth}>`;
        break;
    }
    case 'thematicBreak':
        yield '<hr/>';
        break;
    case 'blockquote':
        yield* serializeToElement(context, 'blockquote', null, node.children);
        break;
    case 'list':
        yield* serializeToElement(context, node.ordered ? 'ol' : 'ul', null, node.children);
        break;
    case 'listItem':
        if (typeof node.checked === 'boolean') {
            yield '<li data-checkbox="">';
            yield `<input type="checkbox" readOnly={true} checked={${node.checked}}/>`;
        } else {
            yield '<li>';
        }
        for (const child of node.children) {
            yield* serialize(context, child);
        }
        yield '</li>';
        break;
    case 'table': {
        yield '<figure>';
        yield '<table>';
        const aligns = node.align || [];
        const [first, ...rows] = node.children;
        yield '<thead>';
        yield* serializeTableRow(context, 'th', aligns, first);
        yield '</thead>';
        yield '<tbody>';
        for (const row of rows) {
            yield* serializeTableRow(context, 'td', aligns, row);
        }
        yield '</tbody>';
        yield '</table>';
        yield '</figure>';
        break;
    }
    case 'tableRow':
        throw createUnsupportedTypeError(node);
    case 'tableCell':
        throw createUnsupportedTypeError(node);
    case 'html':
        yield node.value;
        break;
    case 'code':
        yield '<figure>';
        if (node.meta) {
            yield `<figcaption>${node.meta}</figcaption>`;
        }
        if (node.lang) {
            yield* serializeLowlightToJsx(context.highlight(node.lang, node.value));
        } else {
            yield* serializeLowlightToJsx(context.highlightAuto(node.value));
        }
        yield '</figure>';
        break;
    case 'yaml':
        throw createUnsupportedTypeError(node);
    case 'definition':
        if (node.label) {
            yield '<a';
            yield* serializeAttributes({href: node.url, title: node.title});
            yield `>${node.label}</a>`;
        }
        break;
    case 'footnoteDefinition':
        throw createUnsupportedTypeError(node);
    case 'text':
        yield* serializeStringToJsxSafeString(node.value);
        break;
    case 'emphasis':
        yield* serializeToElement(context, 'i', null, node.children);
        break;
    case 'strong':
        yield* serializeToElement(context, 'b', null, node.children);
        break;
    case 'delete':
        yield* serializeToElement(context, 's', null, node.children);
        break;
    case 'inlineCode':
        yield '<code>';
        yield* serializeStringToJsxSafeString(node.value);
        yield '</code>';
        break;
    case 'break':
        throw createUnsupportedTypeError(node);
    case 'link':
        yield* serializeToElement(
            context,
            'a',
            {href: node.url, title: node.title},
            node.children,
        );
        break;
    case 'image': {
        const localName = `image${context.images.size}`;
        context.images.set(localName, node.url);
        yield '<figure>';
        if (node.alt) {
            yield `<figcaption>${node.alt}</figcaption>`;
        }
        yield `<Image src={${localName}} alt="${node.alt}" placeholder="blur"/>`;
        yield '</figure>';
        break;
    }
    case 'linkReference':
        break;
    case 'imageReference':
        break;
    case 'footnote':
        throw createUnsupportedTypeError(node);
    case 'footnoteReference':
        throw createUnsupportedTypeError(node);
    default:
        throw createUnsupportedTypeError(node);
    }
};

const serializeToElement = function* (
    context: SerializeMarkdownContext,
    tag: string,
    attrs: Attributes | null,
    children: Array<Markdown.Content>,
): Generator<string> {
    yield `<${tag}`;
    yield* serializeAttributes(attrs);
    yield '>';
    for (const node of children) {
        yield* serialize(context, node);
    }
    yield `</${tag}>`;
};

const serializeTableRow = function* (
    context: SerializeMarkdownContext,
    cellTag: string,
    aligns: Array<Markdown.AlignType>,
    row: Markdown.TableRow,
) {
    yield '<tr>';
    let columnIndex = 0;
    for (const cell of row.children) {
        const align = aligns[columnIndex] || '';
        yield* serializeToElement(context, cellTag, {align}, cell.children);
        columnIndex += 1;
    }
    yield '</tr>';
};
