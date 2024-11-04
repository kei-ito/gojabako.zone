import { isString } from "@nlib/typing";
import { SKIP } from "unist-util-visit";
import type { VFileLike } from "../unified.ts";
import { createHastElement } from "./createHastElement.ts";
import type { HastElementVisitor } from "./visitHastElement.ts";

export const visitArticleHeading =
	(_file: VFileLike, _tasks: Array<Promise<void>>): HastElementVisitor =>
	(e) => {
		const { id } = e.properties;
		if (!isString(id)) {
			return null;
		}
		e.children.unshift(
			createHastElement(
				"a",
				{ href: `#${id}`, className: ["fragment-ref"] },
				getHashLabel(e.tagName),
			),
			{ type: "text", value: " " },
		);
		return SKIP;
	};

const getHashLabel = (tagName: string): string | null => {
	const matched = tagName.match(/^h(\d+)$/);
	const headingLevel = matched ? Number.parseInt(matched[1], 10) : 0;
	if (0 < headingLevel) {
		return "#".repeat(headingLevel);
	}
	return null;
};
