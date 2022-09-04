// @ts-check
import * as path from 'path';
import {srcDirectory, pagesDirectory} from './config.paths.mjs';

/** @param {string} componentName */
const getComponentPath = (componentName) => path.join(srcDirectory, 'components', componentName);

const nextConfig = {
    swcMinify: true,
    reactStrictMode: true,
    pageExtensions: ['page.md', 'tsx', 'ts'],
    webpack: (config, {defaultLoaders: {babel}}) => {
        config.module.rules.push(
            {
                test: /\.module\.md$/,
                use: [
                    babel,
                    {
                        loader: '@gjbkz/gojabako.zone-markdown-component-loader-cjs',
                        options: {pagesDirectory, getComponentPath},
                    },
                ],
            },
            {
                test: /\.page\.md$/,
                use: [
                    babel,
                    {
                        loader: '@gjbkz/gojabako.zone-markdown-page-loader-cjs',
                        options: {pagesDirectory, getComponentPath},
                    },
                ],
            },
        );
        return config;
    },
};

// eslint-disable-next-line import/no-default-export
export default nextConfig;
