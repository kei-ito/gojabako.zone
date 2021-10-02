/**
 * @param {string} source
 * @returns {string}
 */
module.exports = async function markdownLoader(source) {
    const {getJsxCode} = await import('../.loader/util/getJsxCode.mjs');
    const {preamble, jsx} = await getJsxCode(source);
    return [
        preamble,
        `export default function Document() {return ${jsx}}`,
    ].join('\n');
};
