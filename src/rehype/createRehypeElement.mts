import { isString } from '@nlib/typing';
import type { Element, ElementContent, Properties } from 'hast';

export const createRehypeElement = (
  tagName: string,
  properties: Properties,
  ...children: Array<ElementContent | string | false | null | undefined>
): Element => ({
  type: 'element',
  tagName,
  properties,
  children: [...listChildren(children)],
});

const listChildren = function* (
  children: Array<ElementContent | string | false | null | undefined>,
): Generator<ElementContent> {
  for (const child of children) {
    if (isString(child)) {
      if (child) {
        yield { type: 'text', value: child };
      }
    } else if (child) {
      yield child;
    }
  }
};
