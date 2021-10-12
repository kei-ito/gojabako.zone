import type {SerializeMarkdownOption} from '../util/serializeMarkdownOption';
import {serializeAttributes} from './Attributes';
import {serializeStringToJsxSafeString} from './StringToJsxSafeString';

export interface HTMLASTNode<T extends string = string> {
    tag: T,
    attributes: Record<string, string>,
    children: Array<HTMLASTNode | string>,
}

export const serializeHTMLASTNode = function* (
    node: HTMLASTNode | string,
    option: SerializeMarkdownOption,
): Generator<string> {
    if (typeof node === 'string') {
        yield* serializeStringToJsxSafeString(node);
        return;
    }
    const {tag, attributes, children} = node;
    yield `<${tag}`;
    yield* serializeAttributes(attributes, option);
    if (0 < children.length) {
        yield '>';
        for (const child of children) {
            yield* serializeHTMLASTNode(child, option);
        }
        yield `</${tag}>`;
    } else {
        yield '/>';
    }
};

