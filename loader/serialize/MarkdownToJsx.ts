// https://github.com/syntax-tree/mdast
import type Markdown from 'mdast';
import type {LowlightRoot} from 'lowlight/lib/core';
import {getTextContent} from './TextContent';
import {serializeStringToJsxSafeString, toSafeString} from './StringToJsxSafeString';
import {createUnsupportedTypeError} from '../util/createUnsupportedTypeError';
import {serializeLowlightToJsx} from './LowlightToJsx';
import type {Attributes} from './Attributes';
import {serializeAttributes} from './Attributes';

type FilterContent<C extends Markdown.Content, T extends Markdown.Content['type']> = C extends {type: T} ? C : never;
export type MarkdownContent<T extends Markdown.Content['type']> = FilterContent<Markdown.Content, T>;
export interface SerializeMarkdownContext {
    fromMarkdown: (source: string) => Markdown.Root,
    highlight: (language: string, value: string) => LowlightRoot,
    highlightAuto: (value: string) => LowlightRoot,
    images: Map<string, string>,
    nodeListOf: <T extends Markdown.Content['type']>(
        type: T,
    ) => Array<MarkdownContent<T>>,
    findDefinition: (id: string) => Markdown.Definition | null,
}

export const serializeMarkdownToJsx = function* (
    context: SerializeMarkdownContext,
    source: string,
) {
    yield* serialize(context, context.fromMarkdown(source), []);
};

export const serializeMarkdownRootToJsx = function* (
    context: SerializeMarkdownContext,
    root: Markdown.Root,
) {
    yield* serialize(context, root, []);
};

// eslint-disable-next-line max-lines-per-function, complexity
const serialize = function* (
    context: SerializeMarkdownContext,
    node: Markdown.Content | Markdown.Root,
    ancestors: Array<Markdown.Content | Markdown.Root>,
): Generator<string> {
    const nextAncestors = [node, ...ancestors];
    switch (node.type) {
    case 'root':
        // console.info(JSON.stringify(node, null, 2));
        yield '<>';
        for (const child of node.children) {
            yield* serialize(context, child, nextAncestors);
        }
        yield* serializeFootnotes(context, nextAncestors);
        yield '</>';
        break;
    case 'paragraph': {
        const {children} = node;
        if (children.every(({type}) => type === 'image')) {
            for (const child of children) {
                yield* serialize(context, child, nextAncestors);
            }
        } else {
            yield* serializeToElement(context, 'p', null, node, nextAncestors);
        }
        break;
    }
    case 'heading': {
        const id = toSafeString(getTextContent(node).toLowerCase().replace(/\s+/, '_'));
        yield `<h${node.depth}>`;
        if (1 < node.depth) {
            yield `<span className="anchor" id="${id}"/>`;
        }
        for (const child of node.children) {
            yield* serialize(context, child, nextAncestors);
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
        yield* serializeToElement(context, 'blockquote', null, node, nextAncestors);
        break;
    case 'list':
        yield* serializeToElement(context, node.ordered ? 'ol' : 'ul', null, node, nextAncestors);
        break;
    case 'listItem':
        if (typeof node.checked === 'boolean') {
            yield '<li data-checkbox="">';
            yield `<input type="checkbox" readOnly={true} checked={${node.checked}}/>`;
        } else {
            yield '<li>';
        }
        for (const child of node.children) {
            yield* serialize(context, child, nextAncestors);
        }
        yield '</li>';
        break;
    case 'table': {
        yield '<figure>';
        yield '<table>';
        const aligns = node.align || [];
        const [first, ...rows] = node.children;
        yield '<thead>';
        yield* serializeTableRow(context, 'th', aligns, first, nextAncestors);
        yield '</thead>';
        yield '<tbody>';
        for (const row of rows) {
            yield* serializeTableRow(context, 'td', aligns, row, nextAncestors);
        }
        yield '</tbody>';
        yield '</table>';
        yield '</figure>';
        break;
    }
    case 'tableRow':
    case 'tableCell':
        throw createUnsupportedTypeError(node);
    case 'html':
        yield node.value;
        break;
    case 'code':
        yield '<figure>';
        if (node.meta) {
            const {children: [caption]} = context.fromMarkdown(node.meta);
            if ('children' in caption) {
                yield* serializeToElement(context, 'figcaption', null, caption, nextAncestors);
            }
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
        break;
    case 'text':
        yield* serializeStringToJsxSafeString(node.value);
        break;
    case 'emphasis':
        yield* serializeToElement(context, 'i', null, node, nextAncestors);
        break;
    case 'strong':
        yield* serializeToElement(context, 'b', null, node, nextAncestors);
        break;
    case 'delete':
        yield* serializeToElement(context, 's', null, node, nextAncestors);
        break;
    case 'inlineCode':
        yield '<code>';
        yield* serializeStringToJsxSafeString(node.value);
        yield '</code>';
        break;
    case 'break':
        yield '<br/>';
        break;
    case 'link':
        yield* serializeToElement(context, 'a', {href: node.url}, node, nextAncestors);
        break;
    case 'image': {
        const isNotInLink = ancestors.every(({type}) => type !== 'link' && type !== 'linkReference');
        if (isNotInLink) {
            yield '<figure>';
            if (node.alt) {
                yield `<figcaption>${node.alt}</figcaption>`;
            }
        }
        const localName = generateImageLocalName(context, node);
        yield `<Image src={${localName}} alt="${node.alt}" placeholder="blur"/>`;
        if (isNotInLink) {
            yield '</figure>';
        }
        break;
    }
    case 'linkReference': {
        const definition = context.findDefinition(node.identifier);
        yield* serializeToElement(context, 'a', {href: definition && definition.url}, node, nextAncestors);
        break;
    }
    case 'imageReference': {
        const definition = context.findDefinition(node.identifier);
        if (definition) {
            const image: Markdown.Image = {...node, ...definition, type: 'image'};
            yield* serialize(context, image, nextAncestors);
        }
        break;
    }
    case 'footnote':
        throw createUnsupportedTypeError(node);
    case 'footnoteReference':
        yield `<sup data-footnote="${node.identifier}">`;
        yield `<span className="anchor" id="footnoteRef-${node.identifier}"/>`;
        yield `<a className="footnoteId" href="#footnote-${node.identifier}">[${node.identifier}]</a>`;
        yield '</sup>';
        break;
    case 'footnoteDefinition':
        break;
    default:
        throw createUnsupportedTypeError(node);
    }
};

const serializeToElement = function* (
    context: SerializeMarkdownContext,
    tag: string,
    attrs: Attributes | null,
    {children}: {children: Array<Markdown.Content>},
    nextAncestors: Array<Markdown.Content | Markdown.Root>,
): Generator<string> {
    yield `<${tag}`;
    yield* serializeAttributes(attrs);
    yield '>';
    for (const node of children) {
        yield* serialize(context, node, nextAncestors);
    }
    yield `</${tag}>`;
};

const serializeTableRow = function* (
    context: SerializeMarkdownContext,
    cellTag: string,
    aligns: Array<Markdown.AlignType>,
    row: Markdown.TableRow,
    nextAncestors: Array<Markdown.Content | Markdown.Root>,
) {
    yield '<tr>';
    let columnIndex = 0;
    for (const cell of row.children) {
        const align = aligns[columnIndex] || '';
        yield* serializeToElement(
            context,
            cellTag,
            {align},
            cell,
            [cell, row, ...nextAncestors],
        );
        columnIndex += 1;
    }
    yield '</tr>';
};

const serializeFootnotes = function* (
    context: SerializeMarkdownContext,
    nextAncestors: Array<Markdown.Content | Markdown.Root>,
) {
    const footnotes = context.nodeListOf('footnoteDefinition');
    if (footnotes.length === 0) {
        return;
    }
    yield '<aside>';
    yield '<dl className="footnotes">';
    for (const footnote of footnotes) {
        yield '<dt>';
        yield `<span className="anchor" id="footnote-${footnote.identifier}"/>`;
        yield `<a className="footnoteId" href="#footnoteRef-${footnote.identifier}">[${footnote.identifier}]</a>`;
        yield '</dt>';
        yield* serializeToElement(context, 'dd', null, footnote, nextAncestors);
    }
    yield '</dl>';
    yield '</aside>';
};

const generateImageLocalName = (
    context: SerializeMarkdownContext,
    node: {url: string},
): string => {
    const localName = `image${context.images.size}`;
    context.images.set(localName, node.url);
    return localName;
};
