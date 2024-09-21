import mdx from '@next/mdx';
import { all } from 'lowlight';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { rehypeArticle } from './src/unified/rehypeArticle.mts';
import { rehypeEmbed } from './src/unified/rehypeEmbed.mts';

const withMDX = mdx({
  options: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      [rehypeHighlight, { languages: { ...all, terminal: all.bash } }],
      [rehypeSlug],
      [rehypeKatex, { output: 'html' }],
      [rehypeEmbed],
      [rehypeArticle],
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'mts', 'mdx'],
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
