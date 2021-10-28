import * as postcss from 'postcss';
import {Error, JSON} from '../es/global';

export const serializeStyle = function* (source: string): Generator<string> {
    yield '{';
    let count = 0;
    for (const {prop, value} of listDeclarations(postcss.parse(`:root{${source}}`))) {
        if (0 < count++) {
            yield ',';
        }
        yield prop.replace(/-(\w)/g, (_, c) => `${c}`.toUpperCase());
        yield `:'${value.replace(/'/g, '\\\'')}'`;
    }
    yield '}';
};

const listDeclarations = function* (node: postcss.ChildNode | postcss.Root): Generator<postcss.Declaration> {
    switch (node.type) {
    case 'root':
    case 'rule':
        for (const child of node.nodes) {
            yield* listDeclarations(child);
        }
        break;
    case 'decl':
        yield node;
        break;
    default:
        throw new Error(`UnexpectedCSSNode: ${JSON.stringify(node, null, 2)}`);
    }
};
