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
    expected: ["利用", "料は、", "$10/時", "以下です。"],
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
