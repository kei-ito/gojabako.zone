import { SKIP } from "unist-util-visit";
import { getSingle } from "../getSingle.ts";
import type { VFileLike } from "../unified.ts";
import { addClass } from "./className.ts";
import { isHastElement } from "./isHastElement.ts";
import type { HastElementVisitor } from "./visitHastElement.ts";

export const visitArticleSup =
	(_file: VFileLike, _tasks: Array<Promise<void>>): HastElementVisitor =>
	(e) => {
		const a = getSingle(e.children);
		if (!isHastElement(a, "a") || !a.properties.dataFootnoteRef) {
			return null;
		}
		addClass(e, "footnote-ref");
		a.properties.dataFootnoteRef = undefined;
		return SKIP;
	};
