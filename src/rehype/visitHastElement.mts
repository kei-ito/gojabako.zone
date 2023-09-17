import { isNonNegativeSafeInteger } from '@nlib/typing';
import type { Element, Parent, Root } from 'hast';
import type { VisitorResult } from 'unist-util-visit';
import { visit } from 'unist-util-visit';

export type HastElementVisitor = (
  e: Element,
  index: number,
  parent: Parent,
) => VisitorResult;
export type HastElementVisitorMap = Record<string, HastElementVisitor>;

export const visitHastElement = (
  tree: Element | Root | null | undefined,
  visitors: HastElementVisitorMap,
): void => {
  if (!tree) {
    return;
  }
  visit(tree, 'element', (node, index, parent) => {
    if (!parent || !isNonNegativeSafeInteger(index)) {
      return null;
    }
    const visitor = visitors[node.tagName];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return visitor ? visitor(node, index, parent) : null;
  });
};
