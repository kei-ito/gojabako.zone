const nextConfig = {
    compiler: {
        styledComponents: true,
    },
    reactStrictMode: true,
    pageExtensions: ['page.md', 'tsx', 'ts'],
    webpack: (config, {defaultLoaders: {babel}}) => {
        config.module.rules.push(
            {test: /\.module\.md$/, use: [babel, './loader/module.md.cjs']},
            {test: /\.page\.md$/, use: [babel, './loader/page.md.cjs']},
        );
        return config;
    },
};

export default nextConfig;
