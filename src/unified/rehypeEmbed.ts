import { isArrayOf, isNonNegativeSafeInteger, isString } from "@nlib/typing";
import type { Element, Root } from "hast";
import type {
  MdxJsxFlowElementHast,
  MdxJsxTextElementHast,
} from "mdast-util-mdx-jsx";
import { SKIP } from "unist-util-visit";
import { getSingle } from "../util/getSingle.ts";
import { embedTwitter } from "../util/rehype/embedTwitter.ts";
import { embedYouTube } from "../util/rehype/embedYouTube.ts";
import { isHastElement } from "../util/rehype/isHastElement.ts";
import { visitHastElement } from "../util/rehype/visitHastElement.ts";
import type { VFileLike } from "../util/unified.ts";

declare module "hast" {
  interface RootContentMap {
    mdxJsxFlowElement: MdxJsxFlowElementHast;
    mdxJsxTextElement: MdxJsxTextElementHast;
  }
}

const services = new Map<
  string,
  (e: Element) => AsyncIterable<Element> | Iterable<Element>
>();
services.set("youtube", embedYouTube);
services.set("twitter", embedTwitter);

export const rehypeEmbed = () => async (tree: Root, _file: VFileLike) => {
  const tasks: Array<() => Promise<void>> = [];
  visitHastElement(tree, {
    pre: (e, index, parent) => {
      const code = getSingle(e.children);
      if (!isHastElement(code, "code")) {
        return null;
      }
      const { className } = code.properties;
      if (!isArrayOf(isString)(className)) {
        return null;
      }
      const prefix = "language-embed:";
      const classIndex = className.findIndex((c) => c.startsWith(prefix));
      if (!isNonNegativeSafeInteger(classIndex)) {
        return null;
      }
      const service = className[classIndex].slice(prefix.length);
      const fn = services.get(service);
      if (fn) {
        tasks.unshift(async () => {
          const replacements = [];
          for await (const c of fn(code)) {
            replacements.push(c);
          }
          parent.children.splice(index, 1, ...replacements);
        });
      } else {
        className[classIndex] = "language-html";
        code.properties["data-embed"] = service;
      }
      return [SKIP, index + 1];
    },
  });
  await Promise.all(tasks.map(async (task) => await task()));
  return tree;
};
