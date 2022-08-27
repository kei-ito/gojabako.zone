import EsifyCSSWebpackPlugin from 'esifycss-webpack-plugin';

const nextConfig = {
    swcMinify: true,
    reactStrictMode: true,
    pageExtensions: ['page.md', 'tsx', 'ts'],
    webpack: (config) => {
        config.module.rules.push(
            {test: /\.module\.md$/, use: ['./.output/loader/module.md.cjs']},
            {test: /\.page\.md$/, use: ['./.output/loader/page.md.cjs']},
        );
        config.resolve.plugins.push(new EsifyCSSWebpackPlugin());
        return config;
    },
};

// eslint-disable-next-line import/no-default-export
export default nextConfig;
