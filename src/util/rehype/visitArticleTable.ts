import { SKIP } from "unist-util-visit";
import type { VFileLike } from "../unified.ts";
import { createHastElement } from "./createHastElement.ts";
import type { HastElementVisitor } from "./visitHastElement.ts";

export const visitArticleTable = (
	_file: VFileLike,
	_tasks: Array<Promise<void>>,
): HastElementVisitor => {
	let tableCount = 0;
	return (e, index, parent) => {
		const id = `table${++tableCount}`;
		parent.children.splice(
			index,
			1,
			createHastElement(
				"figure",
				{ id, dataType: "table" },
				createHastElement(
					"figcaption",
					{},
					createHastElement("span", {}),
					createHastElement("a", {
						href: `#${id}`,
						className: ["fragment-ref"],
					}),
				),
				e,
			),
		);
		return SKIP;
	};
};
