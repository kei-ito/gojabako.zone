import { isObject, isString } from "@nlib/typing";
import { SKIP } from "unist-util-visit";
import { getSingle } from "../getSingle.mts";
import { mdToInlineHast } from "../node/mdToHast.mts";
import type { VFileLike } from "../unified.mts";
import {
  createFragmentRef,
  createFragmentTarget,
  createHastElement,
} from "./createHastElement.mts";
import { insertLineNumbers } from "./insertLineNumbers.mts";
import { isHastElement } from "./isHastElement.mts";
import type { HastElementVisitor } from "./visitHastElement.mts";

export const visitArticlePre = (
  _file: VFileLike,
  _tasks: Array<Promise<void>>,
): HastElementVisitor => {
  let count = 0;
  return (e, index, parent) => {
    const code = getSingle(e.children);
    if (!isHastElement(code, "code", "hljs")) {
      return null;
    }
    let language =
      code.properties.className.find((c) => c.startsWith("language-")) ?? "";
    language = language.slice("language-".length);
    const value = isObject(code.data) && code.data.meta;
    const id = `code${++count}`;
    insertLineNumbers(code, id);
    parent.children.splice(
      index,
      1,
      createHastElement(
        "figure",
        {
          dataType: "code",
          ...(isString(value) ? { className: ["caption"] } : {}),
        },
        createFragmentTarget(id),
        createHastElement(
          "figcaption",
          {},
          createHastElement(
            "span",
            {},
            ...(isString(value) ? mdToInlineHast(value) : []),
          ),
          createHastElement(
            "span",
            { className: ["language-label"] },
            language,
          ),
          createFragmentRef(id),
        ),
        code,
      ),
    );
    return SKIP;
  };
};
