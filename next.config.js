const EsifyCSSWebpackPlugin = require('esifycss-webpack-plugin');

module.exports = {
    reactStrictMode: true,
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.md$/,
            use: [options.defaultLoaders.babel, './markdownLoader.js'],
        });
        config.resolve.plugins.push(new EsifyCSSWebpackPlugin());
        return config;
    },
};
