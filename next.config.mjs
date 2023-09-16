import mdx from '@next/mdx';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeArticle from './src/rehype/article.mts';
import rehypeEmbed from './src/rehype/embed.mts';

const withMDX = mdx({
  options: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeEmbed,
      rehypeHighlight,
      rehypeSlug,
      rehypeKatex,
      rehypeArticle,
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'mdx'],
  reactStrictMode: true,
  webpack: (config, _options) => {
    config.module.rules.push({
      test: /\.mts$/,
      loader: 'esbuild-loader',
      options: { loader: 'ts' },
    });
    return config;
  },
};

export default withMDX(nextConfig);
