import { isString } from "@nlib/typing";
import { EXIT, SKIP } from "unist-util-visit";
import { IconClass } from "../classnames.ts";
import type { VFileLike } from "../unified.ts";
import { addClass } from "./className.ts";
import {
  createFragmentTarget,
  createHastElement,
} from "./createHastElement.ts";
import type { HastElementVisitor } from "./visitHastElement.ts";
import { visitHastElement } from "./visitHastElement.ts";

export const visitArticleLi =
  (_file: VFileLike, _tasks: Array<Promise<void>>): HastElementVisitor =>
  (li) => {
    const { id } = li.properties;
    const idPrefix = "user-content-fn-";
    if (!isString(id) || !id.startsWith(idPrefix)) {
      return null;
    }
    visitHastElement(li, {
      a: (a) => {
        if (!a.properties.dataFootnoteBackref) {
          return null;
        }
        a.properties.dataFootnoteBackref = undefined;
        addClass(a, "footnote-backref");
        a.children.splice(
          0,
          a.children.length,
          createHastElement("span", { className: [IconClass] }, "arrow_insert"),
        );
        return EXIT;
      },
    });
    li.children.unshift(createFragmentTarget(id));
    li.properties.id = undefined;
    return SKIP;
  };
