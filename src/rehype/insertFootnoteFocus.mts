import type { Element } from 'hast';
import { createHastElement } from './createHastElement.mts';

export const insertFootnoteFocus = (node: Element, a: Element) => {
  node.children.push(
    createHastElement('span', {
      dataFootnoteFocus: true,
      id: a.properties.id,
    }),
  );
  delete a.properties.id;
  node.properties.dataFootnoteRef = true;
  delete a.properties.dataFootnoteRef;
};
