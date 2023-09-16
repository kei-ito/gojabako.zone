import type { Element } from 'hast';
import { createRehypeElement } from './createRehypeElement.mts';

export const insertFootnoteFocus = (node: Element, a: Element) => {
  node.children.push(
    createRehypeElement('span', {
      dataFootnoteFocus: true,
      id: a.properties.id,
    }),
  );
  delete a.properties.id;
  node.properties.dataFootnoteRef = true;
  delete a.properties.dataFootnoteRef;
};
