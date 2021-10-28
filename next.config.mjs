/* eslint-disable @nlib/no-globals */
import EsifyCSSWebpackPlugin from 'esifycss-webpack-plugin';

const nextConfig = {
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
};

export default nextConfig;
