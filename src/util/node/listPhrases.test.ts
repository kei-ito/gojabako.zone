import * as assert from "node:assert";
import { test } from "node:test";
import { getTokenizer, listPhrases } from "./listPhrases.ts";

const testCases: Array<{ input: string; expected: Array<string> }> = [
	{
		input: "今日の8時からNext.jsの話をします",
		expected: ["今日の", "8時から", "Next.jsの", "話を", "します"],
	},
	{
		input: "今日はABC 123でNext.js,React(TypeScript)の話を（少しだけ）します",
		expected: [
			"今日は",
			"ABC",
			" ",
			"123で",
			"Next.js,",
			"React",
			"(TypeScript)の",
			"話を",
			"（少しだけ）",
			"します",
		],
	},
	{
		input: "利用料は、$10/時以下です。",
		expected: ["利用料は、", "$10/時以下です。"],
	},
	{ input: "分散型リバーシ", expected: ["分散型", "リバーシ"] },
	{ input: "CSSの色の見え方", expected: ["CSSの", "色の", "見え方"] },
	{
		input: "disabledなフォーム要素はsubmitされない",
		expected: ["disabledな", "フォーム", "要素は", "submit", "されない"],
	},
	{
		input: "Appleでオンライン購入したiPhone 12がau回線で使えるようになるまで",
		expected: [
			"Appleで",
			"オンライン",
			"購入した",
			"iPhone",
			" ",
			"12が",
			"au",
			"回線で",
			"使えるように",
			"なるまで",
		],
	},
	{
		input: "Next.js 13にしました",
		expected: ["Next.js", " ", "13に", "しました"],
	},
	{
		input: "ブログ記事の画像を生成する",
		expected: ["ブログ", "記事の", "画像を", "生成する"],
	},
];

for (const { input, expected } of testCases) {
	test(`tokenize ${input}`, async () => {
		const actual: Array<string> = [];
		const tokenizer = await getTokenizer();
		for (const phrase of listPhrases(tokenizer, input)) {
			actual.push(phrase);
		}
		assert.deepStrictEqual(actual, expected);
	});
}
