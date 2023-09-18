import type { Element, ElementContent, Root, RootContent, Parent } from 'hast';
import { hasClass } from './hasClass.mts';

export const isHastElement = <T extends string>(
  element: ElementContent | Parent | Root | RootContent | null | undefined,
  tagName: T,
  ...classNames: Array<string>
): element is Element => {
  if (!element || !('tagName' in element) || element.tagName !== tagName) {
    return false;
  }
  return classNames.length === 0 || hasClass(element, ...classNames);
};
