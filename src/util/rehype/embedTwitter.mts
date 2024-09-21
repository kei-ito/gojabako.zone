import type { Element } from "hast";
import { fromHtml } from "hast-util-from-html";
import { toString as hastToString } from "hast-util-to-string";
import { EXIT } from "unist-util-visit";
import { visitHastElement } from "./visitHastElement.mts";

export const embedTwitter = (node: Element): Array<Element> => {
  const result: Array<Element> = [];
  visitHastElement(fromHtml(hastToString(node)), {
    blockquote: (e) => {
      e.position = node.position;
      result.push(e);
      return EXIT;
    },
  });
  return result;
};
