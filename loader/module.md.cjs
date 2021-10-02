/**
 * @param {string} source
 * @returns {string}
 */
module.exports = async function markdownLoader(source) {
    const {transpileMarkdown} = await import('../.loader/util/transpileMarkdown.mjs');
    const {imports, jsx} = await transpileMarkdown(source);
    return [
        imports,
        `export default function Document() {return ${jsx}}`,
    ].join('\n');
};
