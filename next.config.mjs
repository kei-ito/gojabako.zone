import EsifyCSSWebpackPlugin from 'esifycss-webpack-plugin';

const nextConfig = {
    swcMinify: true,
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

// eslint-disable-next-line import/no-default-export
export default nextConfig;
