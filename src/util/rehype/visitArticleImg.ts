import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { isNonNegativeSafeInteger, isString } from "@nlib/typing";
import type { Element } from "hast";
import type { MdxJsxTextElementHast } from "mdast-util-mdx-jsx";
import type { Position } from "unist";
import { SKIP } from "unist-util-visit";
import { componentsDir } from "../node/directories.ts";
import { filePathToFileUrl } from "../node/filePathToFileUrl.ts";
import { mdToInlineHast } from "../node/mdToHast.ts";
import type { VFileLike } from "../unified.ts";
import { addClass } from "./className.ts";
import {
	createFragmentRef,
	createFragmentTarget,
	createHastElement,
} from "./createHastElement.ts";
import { createMdxEsm } from "./createMdxJsEsm.ts";
import { createMdxJsxTextElement } from "./createMdxJsxTextElement.ts";
import { isHastElement } from "./isHastElement.ts";
import { serializePropertyValue } from "./serializePropertyValue.ts";
import type { HastElementVisitor } from "./visitHastElement.ts";

const mdxImageComponentFile = new URL("MdxImage", componentsDir);

export const visitArticleImg = (
	file: VFileLike,
	tasks: Array<Promise<void>>,
): HastElementVisitor => {
	let imageCount = 0;
	const imported = new Map<string, string>();
	let sourcePromise: Promise<string> | undefined;
	return (e, index, parent) => {
		const { src } = e.properties;
		if (!isString(src)) {
			return null;
		}
		if (!src.startsWith("./")) {
			throw new Error(`InvalidSrc: ${src}`);
		}
		const elements: Array<Element | MdxJsxTextElementHast> = [];
		if (imageCount === 0) {
			const pathToMdxImage = path.relative(
				fileURLToPath(new URL(".", filePathToFileUrl(file.path))),
				fileURLToPath(mdxImageComponentFile),
			);
			elements.push(
				createMdxEsm(`import { MdxImage as Image } from '${pathToMdxImage}';`),
			);
		}
		const id = `img${++imageCount}`;
		let name = imported.get(src);
		if (!name) {
			name = `_${id}`;
			imported.set(src, name);
			elements.push(createMdxEsm(`import ${name} from '${src}';`));
		}
		if (isHastElement(parent, "p") && parent.children.length === 1) {
			const alt = createHastElement("span", {});
			if (e.position) {
				sourcePromise = sourcePromise ?? readFile(file.path, "utf8");
				tasks.push(parseAlt(parent, alt, sourcePromise, e.position));
			}
			parent.tagName = "figure";
			parent.properties.dataType = "image";
			elements.push(
				createFragmentTarget(id),
				createHastElement("figcaption", {}, alt, createFragmentRef(id)),
			);
		}
		elements.push(
			createMdxJsxTextElement("Image", {
				src: [name],
				alt: serializePropertyValue(e.properties.alt),
			}),
		);
		parent.children.splice(index, 1, ...elements);
		return [SKIP, index + elements.length];
	};
};

const parseAlt = async (
	parent: Element,
	alt: Element,
	sourcePromise: Promise<string>,
	{ start: { offset: start }, end: { offset: end } }: Position,
) => {
	if (!(isNonNegativeSafeInteger(start) && isNonNegativeSafeInteger(end))) {
		return;
	}
	const matched = /!\[(.*)\]\(.*?\)/.exec(
		(await sourcePromise).slice(start, end),
	);
	if (!matched) {
		return;
	}
	const children = [...mdToInlineHast(matched[1])];
	alt.children.push(...children);
	if (0 < children.length) {
		addClass(parent, "caption");
	}
};
