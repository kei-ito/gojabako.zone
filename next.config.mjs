import mdx from "@next/mdx";
import { all } from "lowlight";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { rehypeArticle } from "./src/unified/rehypeArticle.ts";
import { rehypeEmbed } from "./src/unified/rehypeEmbed.ts";

const withMDX = mdx({
	options: {
		remarkPlugins: [remarkGfm, remarkMath],
		rehypePlugins: [
			[rehypeHighlight, { languages: { ...all, terminal: all.bash } }],
			[rehypeSlug],
			[rehypeKatex, { output: "html" }],
			[rehypeEmbed],
			[rehypeArticle],
		],
	},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	productionBrowserSourceMaps: true,
	pageExtensions: ["tsx", "ts", "mdx"],
	reactStrictMode: true,
	env: {
		OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS,
		AWS_APP_ID: process.env.AWS_APP_ID,
	},
	webpack: (config, _options) => {
		config.module.rules.push({
			test: /\.ts$/,
			loader: "esbuild-loader",
			options: { loader: "ts" },
		});
		config.module.rules.push(
			...(function* () {
				// https://react-svgr.com/docs/next/#usage
				// 既存のSVG読み込みルールを取得
				const fileLoaderRule = config.module.rules.find((rule) =>
					rule.test?.test?.(".svg"),
				);
				if (fileLoaderRule) {
					// ?urlが付いている場合は既存ルールで読む
					yield {
						...fileLoaderRule,
						test: /\.svg$/i,
						resourceQuery: /url/, // *.svg?url
					};
					// ReactComponentとして読む
					yield {
						test: /\.svg$/i,
						issuer: fileLoaderRule.issuer,
						resourceQuery: {
							not: [...fileLoaderRule.resourceQuery.not, /url/],
						},
						use: ["@svgr/webpack"],
					};
					// 既存のSVG読み込みルールは*.svgを無視させる
					fileLoaderRule.exclude = /\.svg$/i;
				} else {
					// ReactComponentとして読む
					yield { test: /\.svg$/i, use: ["@svgr/webpack"] };
				}
			})(),
		);
		return config;
	},
};

export default withMDX(nextConfig);
