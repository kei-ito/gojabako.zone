//@ts-check
import mdx from '@next/mdx';
import remarkGfm from 'remark-gfm';
import remarkRuby from 'remark-ruby';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import rehypeEmbed from './src/rehype/embed.mjs';
import rehypeWrap from './src/rehype/wrap.mjs';

const withMDX = mdx({
  options: {
    // @ts-ignore
    remarkPlugins: [remarkGfm, remarkRuby, remarkMath],
    // @ts-ignore
    rehypePlugins: [
      rehypeEmbed,
      rehypeHighlight,
      rehypeSlug,
      rehypeKatex,
      rehypeWrap,
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'mdx'],
  reactStrictMode: true,
};

export default withMDX(nextConfig);
