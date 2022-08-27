/**
 * @this {import('./util/LoaderContext').LoaderThis}
 * @param {string} source
 * @returns {string}
 */
module.exports = async function markdownPageLoader(source) {
    const {loadMarkdownPage} = await import('../.output/loader/page.md.mjs');
    const code = loadMarkdownPage.call(this, source);
    // console.info(code);
    return code;
};
