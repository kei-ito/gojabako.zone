import { isString } from '@nlib/typing';
import type { Element } from 'hast';

export const hasClass = (
  { properties: { className: list } }: Element,
  ...requiredClassNames: Array<string>
): boolean => {
  if (!isString.array(list)) {
    return false;
  }
  return requiredClassNames.every((name) => list.includes(name));
};
