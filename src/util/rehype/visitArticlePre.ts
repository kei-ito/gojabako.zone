import { isObject, isString } from "@nlib/typing";
import { SKIP } from "unist-util-visit";
import { getSingle } from "../getSingle.ts";
import { mdToInlineHast } from "../node/mdToHast.ts";
import type { VFileLike } from "../unified.ts";
import {
	createFragmentRef,
	createFragmentTarget,
	createHastElement,
} from "./createHastElement.ts";
import { insertLineNumbers } from "./insertLineNumbers.ts";
import { isHastElement } from "./isHastElement.ts";
import type { HastElementVisitor } from "./visitHastElement.ts";

export const visitArticlePre = (
	_file: VFileLike,
	_tasks: Array<Promise<void>>,
): HastElementVisitor => {
	let count = 0;
	return (e, index, parent) => {
		const codeElement = getSingle(e.children);
		if (!isHastElement(codeElement, "code", "hljs")) {
			return null;
		}
		const caption = isObject(codeElement.data) && codeElement.data.meta;
		const elementId = `code${++count}`;
		parent.children.splice(
			index,
			1,
			createHastElement(
				"figure",
				{
					dataType: "code",
					...(isString(caption) ? { className: ["caption"] } : {}),
				},
				createFragmentTarget(elementId),
				createHastElement(
					"figcaption",
					{},
					// FragmentRefを右に表示するためこのspanは必須
					createHastElement(
						"span",
						{},
						...(isString(caption) ? mdToInlineHast(caption) : []),
					),
					createFragmentRef(elementId),
				),
				insertLineNumbers(codeElement, elementId),
			),
		);
		return SKIP;
	};
};
