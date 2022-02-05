/* eslint-disable @nlib/no-globals */
/**
 * @this {import('./util/LoaderContext').LoaderThis}
 * @param {string} source
 * @returns {string}
 */
module.exports = async function markdownPageLoader(source) {
    const {loadMarkdownPage} = await import('../.output/loader/page.md.mjs');
    const code = await loadMarkdownPage(this, source);
    // console.info(code);
    return code;
};
