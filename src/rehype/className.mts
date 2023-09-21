import { isString } from '@nlib/typing';
import type { Element } from 'hast';

export const hasClass = (
  { properties: { className } }: Element,
  ...requiredClassNames: Array<string>
): boolean => {
  if (isString.array(className)) {
    return requiredClassNames.every((name) => className.includes(name));
  }
  if (isString(className) && requiredClassNames.length === 1) {
    return className === requiredClassNames[0];
  }
  return false;
};

export const addClass = (element: Element, ...classNames: Array<string>) => {
  const newClassNames = new Set<string>();
  const current = element.properties.className;
  if (isString.array(current)) {
    for (const name of current) {
      newClassNames.add(name);
    }
  } else if (isString(current)) {
    newClassNames.add(current);
  }
  for (const name of classNames) {
    newClassNames.add(name);
  }
  element.properties.className = [...newClassNames];
};
