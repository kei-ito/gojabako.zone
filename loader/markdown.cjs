/**
 * @param {string} source
 * @returns {string}
 */
const markdownLoader = async (source) => {
    const {markdownLoader: load} = await import('./markdown.mjs');
    return await load(source);
};
// eslint-disable-next-line @nlib/no-globals
module.exports = markdownLoader;
