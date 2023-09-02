//@ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'mdx'],
  reactStrictMode: true,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.mdx$/,
      use: [
        options.defaultLoaders.babel,
        { loader: './src/loaders/mdxLoader.mjs' },
      ],
    });
    return config;
  },
};

export default nextConfig;
