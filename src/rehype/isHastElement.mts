import { isString } from '@nlib/typing';
import type { Element, ElementContent, Root, RootContent } from 'hast';

interface HastElement<T extends string> extends Element {
  tagName: T;
}

export const isHastElement = <T extends string>(
  element: ElementContent | Root | RootContent,
  tagName: T,
  requiredClassNames?: Array<string>,
): element is HastElement<T> => {
  if (element.type !== 'element') {
    return false;
  }
  if (element.tagName !== tagName) {
    return false;
  }
  if (requiredClassNames) {
    const { className } = element.properties;
    if (!isString.array(className)) {
      return false;
    }
    for (const name of requiredClassNames) {
      if (!className.includes(name)) {
        return false;
      }
    }
  }
  return true;
};
