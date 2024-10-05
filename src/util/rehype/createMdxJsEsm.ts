import { parse } from "acorn";
import type { Program } from "estree";
import type { Element } from "hast";
import type { MdxjsEsm } from "mdast-util-mdxjs-esm";

export const createMdxEsm = (value: string): Element => {
	const node = parse(value, { ecmaVersion: "latest", sourceType: "module" });
	const mdxJsEsm: MdxjsEsm = {
		type: "mdxjsEsm",
		value,
		data: { estree: node as unknown as Program },
	};
	return mdxJsEsm as unknown as Element;
};
