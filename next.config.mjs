import mdx from '@next/mdx';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import rehypeEmbed from './src/rehype/embed.mjs';
import rehypeArticle from './src/rehype/article.mjs';

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
};

export default withMDX(nextConfig);
