/**
 * @this {import('./util/LoaderContext').LoaderThis}
 * @param {string} source
 * @returns {string}
 */
module.exports = async function markdownModuleLoader(source) {
    const {loadMarkdownModule} = await import('../.output/loader/module.md.mjs');
    const code = loadMarkdownModule.call(this, source);
    return code;
};
