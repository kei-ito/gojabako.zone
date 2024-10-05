import { SKIP } from "unist-util-visit";
import { site } from "../site.ts";
import type { VFileLike } from "../unified.ts";
import { serializePropertyValue } from "./serializePropertyValue.ts";
import type { HastElementVisitor } from "./visitHastElement.ts";

export const visitArticleA =
  (_file: VFileLike, _tasks: Array<Promise<void>>): HastElementVisitor =>
  (a) => {
    const href = serializePropertyValue(a.properties.href);
    if (/^\w+:\/\//.test(href) && !href.startsWith(site.baseUrl.href)) {
      a.properties.target = "_blank";
    }
    return SKIP;
  };
