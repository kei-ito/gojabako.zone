import { isNonNegativeSafeInteger } from '@nlib/typing';
import type { Parent } from 'mdast';
import type { Node } from 'unist';
import type { VisitorResult } from 'unist-util-visit';
import { visit } from 'unist-util-visit';

export type MdastElementVisitor<T extends Node> = (
  e: T,
  index: number,
  parent: Parent,
) => VisitorResult;

export const visitMdastElement = <T extends Node>(
  tree: Parent | null | undefined,
  visitors: Record<string, MdastElementVisitor<T>>,
): void => {
  if (!tree) {
    return;
  }
  visit(tree, (node, index, parent) => {
    if (!parent || !isNonNegativeSafeInteger(index)) {
      return null;
    }
    const visitor = visitors[node.type];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return visitor ? visitor(node as T, index, parent) : null;
  });
};
