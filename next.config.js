/* eslint-disable @nlib/no-globals */
const EsifyCSSWebpackPlugin = require('esifycss-webpack-plugin');

module.exports = {
    reactStrictMode: true,
    webpack: (config) => {
        config.resolve.plugins.push(new EsifyCSSWebpackPlugin());
        return config;
    },
};
