import { isNonNegativeSafeInteger } from '@nlib/typing';
import type { Parent, Root, RootContentMap, RootContent } from 'mdast';
import type { VisitorResult } from 'unist-util-visit';
import { visit } from 'unist-util-visit';

export type MdastElementVisitor<T> = (
  e: T,
  index: number,
  parent: Parent,
) => VisitorResult;

export const visitMdastElement = <T extends RootContentMap>(
  tree: Root | RootContent | null | undefined,
  visitors: {
    [K in keyof T]?: MdastElementVisitor<T[K]>;
  },
): void => {
  if (tree) {
    visit(tree, (node, index, parent) => {
      if (!parent || !isNonNegativeSafeInteger(index)) {
        return null;
      }
      const visitor = visitors[node.type as keyof RootContentMap] as
        | MdastElementVisitor<RootContent>
        | undefined;
      return visitor ? visitor(node as RootContent, index, parent) : null;
    });
  }
};
