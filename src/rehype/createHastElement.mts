import { isString } from '@nlib/typing';
import type { Element, ElementContent, Properties } from 'hast';

export const createHastElement = (
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

export const createFragmentTarget = (id: string) =>
  createHastElement('span', { id, className: ['fragment-target'] });

export const createFragmentRef = (id: string) =>
  createHastElement('a', {
    href: `#${id}`,
    className: ['fragment-ref'],
  });
