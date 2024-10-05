import { isNonNegativeSafeInteger } from "@nlib/typing";
import type { Element, Parent, Root } from "hast";
import type { VisitorResult } from "unist-util-visit";
import { visit } from "unist-util-visit";

export type HastElementVisitor<T extends Element = Element> = (
  e: T,
  index: number,
  parent: Parent,
) => VisitorResult;

export const visitHastElement = <T extends Element>(
  tree: Element | Root | null | undefined,
  visitors: Record<string, HastElementVisitor<T>>,
): void => {
  if (!tree) {
    return;
  }
  visit(tree, "element", (node, index, parent) => {
    if (!parent || !isNonNegativeSafeInteger(index)) {
      return null;
    }
    const visitor = visitors[node.tagName];
    return visitor ? visitor(node as T, index, parent) : null;
  });
};
