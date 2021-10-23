import type {LowlightRoot, LowlightElementSpan, Text} from 'lowlight/lib/core';
import {readline} from '../../packages/node/readline';
import {createUnsupportedTypeError} from '../util/createUnsupportedTypeError';
import {serializeAttributes} from './Attributes';
import {serializeStringToJsxSafeString} from './StringToJsxSafeString';

type LowlightNode = LowlightElementSpan | LowlightRoot | Text;
interface Ancestor {
    tagName: string,
    attributes?: Record<string, string>,
}

const serializeStart = function* (
    {tagName, attributes}: Ancestor,
) {
    yield `<${tagName}`;
    yield* serializeAttributes(attributes, {jsx: true});
    yield '>';
};

const serializeEnd = function* (
    {tagName}: Ancestor,
) {
    yield `</${tagName}>`;
};

const serializeLineStart = function* (
    ancestors: Array<Ancestor>,
) {
    for (const ancestor of ancestors) {
        yield* serializeStart(ancestor);
    }
};

const serializeLineEnd = function* (
    ancestors: Array<Ancestor>,
) {
    for (let index = ancestors.length; index--;) {
        yield* serializeEnd(ancestors[index]);
    }
};

const serialize = function* (
    node: LowlightNode,
    ancestors: Array<Ancestor>,
): Generator<string> {
    switch (node.type) {
    case 'text': {
        let lineCount = 0;
        for (const line of readline(node.value)) {
            if (0 < lineCount++) {
                yield* serializeLineEnd(ancestors);
                yield* serializeLineStart(ancestors);
            }
            yield* serializeStringToJsxSafeString(line);
        }
        break;
    }
    case 'element': {
        const {tagName, properties} = node;
        const attributes = {className: properties.className.join(' ')};
        const ancestor = {tagName, attributes};
        const nextAncestors = ancestors.concat(ancestor);
        yield* serializeStart(ancestor);
        for (const child of node.children) {
            yield* serialize(child, nextAncestors);
        }
        yield* serializeEnd(ancestor);
        break;
    }
    case 'root': {
        yield `<ol data-lang="${node.data.language}">`;
        const nextAncestors: Array<Ancestor> = ancestors.concat(
            {tagName: 'li'},
            {tagName: 'code'},
        );
        yield* serializeLineStart(nextAncestors);
        for (const child of node.children) {
            yield* serialize(child, nextAncestors);
        }
        yield* serializeLineEnd(nextAncestors);
        yield '</ol>';
        break;
    }
    default:
        throw createUnsupportedTypeError(node);
    }
};

export const serializeLowlightToJsx = function* (
    node: LowlightNode,
): Generator<string> {
    yield* serialize(node, []);
};
