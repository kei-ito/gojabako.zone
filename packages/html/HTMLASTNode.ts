import {toJsxSafeString} from '../es/toJsxSafeString';
import type {SerializeAttributeOptions} from './Attributes';
import {serializeAttributes} from './Attributes';

export interface HTMLASTNode<T extends string = string> {
    tag: T,
    attributes: Record<string, string>,
    children: Array<HTMLASTNode | string>,
}

export const serializeHTMLASTNode = function* (
    node: HTMLASTNode | string,
    option: SerializeAttributeOptions,
): Generator<string> {
    if (typeof node === 'string') {
        yield toJsxSafeString(node);
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

