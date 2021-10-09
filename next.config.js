const EsifyCSSWebpackPlugin = require('esifycss-webpack-plugin');

module.exports = {
    reactStrictMode: true,
    pageExtensions: ['page.md', 'tsx', 'ts'],
    webpack: (config, {defaultLoaders: {babel}}) => {
        config.module.rules.push(
            {test: /\.module\.md$/, use: [babel, './loader/module.md.cjs']},
            {test: /\.page\.md$/, use: [babel, './loader/page.md.cjs']},
        );
        config.resolve.plugins.push(new EsifyCSSWebpackPlugin());
        return config;
    },
    rewrites: async () => {
        await Promise.resolve();
        return [
            {source: '/sitemap.xml', destination: '/api/sitemap'},
            {source: '/feed.atom', destination: '/api/feed'},
        ];
    },
};
