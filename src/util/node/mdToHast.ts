import type { ElementContent } from "hast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";

export const mdToInlineHast = function* (
	markdown: string,
): Generator<ElementContent> {
	const root = mdToHast(markdown);
	for (const node of root.type === "root" ? root.children : [root]) {
		switch (node.type) {
			case "text":
				yield node;
				break;
			case "element":
				if (node.tagName === "p") {
					for (const child of node.children) {
						yield child;
					}
				} else {
					yield node;
				}
				break;
			default:
		}
	}
};

export const mdToHast = (markdown: string) => toHast(fromMarkdown(markdown));
