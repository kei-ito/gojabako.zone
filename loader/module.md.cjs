/**
 * @this {import('./util/LoaderContext').LoaderThis}
 * @param {string} source
 * @returns {string}
 */
module.exports = async function markdownModuleLoader(source) {
    const {loadMarkdownModule} = await import('../.tool/load/MarkdownModule.mjs');
    const code = await loadMarkdownModule(this, source);
    return code;
};
