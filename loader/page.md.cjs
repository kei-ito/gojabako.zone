const path = require('path');
const absolutePathSection = path.join(__dirname, '../src/components/Section');
/**
 * @param {Object} props
 * @param {string} props.imports
 * @param {string} props.jsx
 * @param {string} props.cwd
 */
const serializeCode = function* (
    {imports, jsx, cwd},
) {
    yield 'import Head from \'next/head\';';
    yield `import {Section} from '${path.relative(cwd, absolutePathSection)}';`;
    yield imports;
    yield 'export default function Page() {';
    yield '    return <>';
    yield '        <Head>';
    yield '        </Head>';
    yield '        <main>';
    yield '            <article>';
    yield `                ${jsx}`;
    yield '            </article>';
    yield '        </main>';
    yield '    </>;';
    yield '}';
};

/**
 * @this {{context: string, resource: string, resourcePath: string}}
 * @param {string} source
 * @returns {string}
 */
module.exports = async function markdownLoader(source) {
    const {transpileMarkdown} = await import('../.loader/util/transpileMarkdown.mjs');
    const {imports, jsx} = await transpileMarkdown(source);
    const cwd = path.dirname(this.resourcePath);
    const params = {imports, jsx, cwd};
    const code = [...serializeCode(params)].join('\n');
    return code;
};
