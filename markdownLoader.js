/** @typedef {import('mdast-util-from-markdown/lib').Node} Node */
/** @typedef {import('mdast-util-from-markdown/lib').Code} Code */
/** @typedef {import('lowlight').lowlight} Lowlight */
/** @typedef {import('lowlight/lib/core').LowlightRoot} LowlightRoot */
/** @typedef {import('lowlight/lib/core').LowlightElementSpan} LowlightElementSpan */
/** @typedef {import('lowlight/lib/core').Text} LowlightText */
/** @type {Lowlight} */
let lowlight;

/**
 * @param {string} c
 * @returns {string}
 */
const toCharacterReference = (c) => `&#${c.codePointAt(0)};`;

/**
 * @param {string} value
 * @returns {string}
 */
const sanitize = (value) => value.replace(/[{}]/g, (c) => toCharacterReference(c));

/**
 * @param node {Node}
 */
const serializeNodeToJsxCode = function* (node) {
    switch (node.type) {
    case 'text':
        yield sanitize(node.value);
        break;
    case 'root':
        yield 'const Document = () => ';
        yield* serializeNodeToJsxTagCode('', node);
        yield ';export default Document';
        break;
    case 'paragraph':
        yield* serializeNodeToJsxTagCode('p', node);
        break;
    case 'heading':
        yield* serializeNodeToJsxTagCode(`h${node.depth}`, node);
        break;
    case 'list':
        yield* serializeNodeToJsxTagCode(node.ordered ? 'ol' : 'ul', node);
        break;
    case 'listItem':
        yield* serializeNodeToJsxTagCode('li', node);
        break;
    case 'inlineCode':
        yield `<code>${node.value}</code>`;
        break;
    case 'code':
        yield* serializeLowlightAstToJsxCode(lowlight.highlight(node.lang, node.value));
        break;
    default:
        throw new Error(`UnsupportedNodeType: ${JSON.stringify(node, null, 2)}`);
    }
};

/**
 * @param tag {string}
 * @param node {Node}
 */
const serializeNodeToJsxTagCode = function* (tag, node) {
    yield `<${tag}>`;
    for (const child of node.children) {
        yield* serializeNodeToJsxCode(child);
    }
    yield `</${tag}>`;
};

/**
 * @param {LowlightRoot | LowlightElementSpan | LowlightText} node
 * @returns {Generator<string>}
 */
const serializeLowlightAstToJsxCode = function* (node) {
    switch (node.type) {
    case 'text':
        yield sanitize(node.value).replace(/\n/g, '</code></li><li><code>');
        break;
    case 'root':
        yield `<ol data-lang="${node.data.language}"><li><code>`;
        for (const child of node.children) {
            yield* serializeLowlightAstToJsxCode(child);
        }
        yield '</code></li></ol>';
        break;
    case 'element': {
        const {tagName, properties} = node;
        yield `<${tagName} `;
        for (const [name, values] of Object.entries(properties)) {
            yield `${name}="${values.join(' ')}"`;
        }
        yield '>';
        for (const child of node.children) {
            yield* serializeLowlightAstToJsxCode(child);
        }
        yield `</${tagName}>`;
        break;
    }
    default:
        throw new Error(`UnsupportedNodeType: ${JSON.stringify(node, null, 2)}`);
    }
};

/**
 * @param source {string}
 * @returns {Promise<string>}
 */
const markdownLoader = async (source) => {
    const {fromMarkdown} = await import('mdast-util-from-markdown');
    lowlight = (await import('lowlight')).lowlight;
    const tree = fromMarkdown(source);
    return [...serializeNodeToJsxCode(tree)].join('');
};
module.exports = markdownLoader;
