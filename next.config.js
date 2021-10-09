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
    headers: async () => {
        await Promise.resolve();
        return [
            {
                source: '/feed.atom',
                headers: [
                    {key: 'content-type', value: 'application/atom+xml; charset=utf-8'},
                ],
            },
            {
                source: '/sitemap.xml',
                headers: [
                    {key: 'content-type', value: 'application/xml; charset=utf-8'},
                ],
            },
        ];
    },
};
