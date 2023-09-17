import type { Element, ElementContent, Root, RootContent } from 'hast';
import { hasClass } from './hasClass.mts';

interface HastElement<T extends string> extends Element {
  tagName: T;
}

export const isHastElement = <T extends string>(
  element: ElementContent | Root | RootContent | null | undefined,
  tagName: T,
  ...classNames: Array<string>
): element is HastElement<T> => {
  if (!element || element.type !== 'element') {
    return false;
  }
  if (element.tagName !== tagName) {
    return false;
  }
  return classNames.length === 0 || hasClass(element, ...classNames);
};
