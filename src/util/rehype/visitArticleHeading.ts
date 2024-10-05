import { isString } from "@nlib/typing";
import { SKIP } from "unist-util-visit";
import type { VFileLike } from "../unified.ts";
import {
	createFragmentRef,
	createFragmentTarget,
} from "./createHastElement.ts";
import type { HastElementVisitor } from "./visitHastElement.ts";

export const visitArticleHeading =
	(_file: VFileLike, _tasks: Array<Promise<void>>): HastElementVisitor =>
	(e) => {
		const { id } = e.properties;
		if (!isString(id)) {
			return null;
		}
		e.children.unshift(createFragmentTarget(id), createFragmentRef(id));
		e.properties.id = undefined;
		return SKIP;
	};
