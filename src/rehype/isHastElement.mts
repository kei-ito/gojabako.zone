import { isString } from '@nlib/typing';
import type { Element, ElementContent, Root, RootContent } from 'hast';

export const isHastElement = (
  element: ElementContent | Root | RootContent,
  tagName: string,
  requiredClassNames?: Array<string>,
): element is Element => {
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
