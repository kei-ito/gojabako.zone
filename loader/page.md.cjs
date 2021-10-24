/* eslint-disable @nlib/no-globals */
/**
 * @this {import('./util/LoaderContext').LoaderThis}
 * @param {string} source
 * @returns {string}
 */
module.exports = async function markdownPageLoader(source) {
    const loadMarkdownPage = await import('../.next/loader/MarkdownPage.mjs');
    const code = await loadMarkdownPage(this, source);
    return code;
};

/*
  rootContext: '/略/gojabako.zone',
  mode: 'development',
  target: 'node',
  context: '/略/gojabako.zone/src/pages',
  resourcePath: '/略/gojabako.zone/src/pages/markdown.page.md',
  resourceQuery: '',
  resourceFragment: '',
  resource: '/略/gojabako.zone/src/pages/markdown.page.md',
  request: '/略/gojabako.zone/node_modules/next/dist/build/babel/loader/index.js??ruleSet[1].rules[5].use[0]!/略/gojabako.zone/loader/page.md.cjs!/略/gojabako.zone/src/pages/markdown.page.md',
  remainingRequest: '/略/gojabako.zone/src/pages/markdown.page.md',
  currentRequest: '/略/gojabako.zone/loader/page.md.cjs!/略/gojabako.zone/src/pages/markdown.page.md',
  previousRequest: '/略/gojabako.zone/node_modules/next/dist/build/babel/loader/index.js??ruleSet[1].rules[5].use[0]',
  query: ''
 */
