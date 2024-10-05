import type { Element, Text } from "hast";
import { createHastElement } from "./createHastElement.ts";

export const insertLineNumbers = (node: Element, codeId: string) => {
	let lineNumber = 0;
	const elements: Array<Element> = [];
	for (const line of listFragments(node)) {
		if (line !== 0) {
			const id = `${codeId}L${++lineNumber}`;
			elements.push(
				createHastElement(
					"a",
					{ href: `#${id}`, className: ["hljs-ln"], draggable: "false" },
					createHastElement("span", { id, className: ["fragment-target"] }),
					createHastElement("span", {}, `${lineNumber}`),
				),
				createHastElement("span", {}, ...line),
			);
		}
	}
	if (
		2 <= elements.length &&
		elements[elements.length - 1].children.length === 0
	) {
		elements.splice(-2, 2);
	}
	node.children = elements;
};

const listFragments = function* (
	node: Element,
): Generator<Array<Element | Text> | 0> {
	let buffer: Array<Element | Text> = [];
	const flush = function* (): Generator<Array<Element | Text>> {
		yield buffer.filter((e) => !isEmptyText(e));
		buffer = [];
	};
	for (const child of node.children) {
		switch (child.type) {
			case "text":
				for (const value of listLines(child.value)) {
					if (value === 0) {
						yield* flush();
						yield 0;
					} else {
						buffer.push({ type: "text", value });
					}
				}
				break;
			case "element":
				for (const children of listFragments(child)) {
					if (children === 0) {
						yield* flush();
						yield 0;
					} else {
						buffer.push({ ...child, children });
					}
				}
				break;
			default:
		}
	}
	if (0 < buffer.length) {
		yield* flush();
	}
};

const isEmptyText = (e: Element | Text) => {
	return e.type === "text" && !e.value;
};

const listLines = function* (text: string): Generator<string | 0> {
	let pos = 0;
	while (pos <= text.length) {
		if (0 < pos) {
			yield 0;
		}
		const index = text.indexOf("\n", pos);
		if (index < 0) {
			yield text.slice(pos);
			break;
		}
		yield text.slice(pos, index);
		pos = index + 1;
	}
};
