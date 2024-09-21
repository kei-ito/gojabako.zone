import { SKIP } from "unist-util-visit";
import { getSingle } from "../getSingle.mts";
import type { VFileLike } from "../unified.mts";
import { addClass } from "./className.mts";
import { createFragmentTarget } from "./createHastElement.mts";
import { isHastElement } from "./isHastElement.mts";
import { serializePropertyValue } from "./serializePropertyValue.mts";
import type { HastElementVisitor } from "./visitHastElement.mts";

export const visitArticleSup =
  (_file: VFileLike, _tasks: Array<Promise<void>>): HastElementVisitor =>
  (e) => {
    const a = getSingle(e.children);
    if (!isHastElement(a, "a") || !a.properties.dataFootnoteRef) {
      return null;
    }
    addClass(e, "footnote-ref");
    e.children.unshift(
      createFragmentTarget(serializePropertyValue(a.properties.id)),
    );
    a.properties.id = undefined;
    a.properties.dataFootnoteRef = undefined;
    return SKIP;
  };
