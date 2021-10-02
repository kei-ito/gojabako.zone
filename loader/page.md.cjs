const path = require('path');
const absolutePathSection = path.join(__dirname, '../src/components/Section');
/**
 * @param {Object} props
 * @param {string} props.preamble
 * @param {string} props.jsx
 * @param {string} props.cwd
 */
const serializeCode = function* (
    {preamble, jsx, cwd},
) {
    yield 'import Head from \'next/head\';';
    yield `import {Section} from '${path.relative(cwd, absolutePathSection)}';`;
    yield preamble;
    yield 'export default function Page() {';
    yield '    return <>';
    yield '        <Head>';
    yield '        </Head>';
    yield '        <main>';
    yield '            <Section>';
    yield `                ${jsx}`;
    yield '            </Section>';
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
    const {getJsxCode} = await import('./util/getJsxCode.mjs');
    const {preamble, jsx} = await getJsxCode(source);
    const cwd = path.dirname(this.resourcePath);
    const params = {preamble, jsx, cwd};
    const code = [...serializeCode(params)].join('\n');
    return code;
};
