import { isArray } from '@nlib/typing';
import type { Properties } from 'hast';

export const serializePropertyValue = (value: Properties[string]): string => {
  if (isArray(value)) {
    return value.join(',');
  }
  return `${value}`;
};
