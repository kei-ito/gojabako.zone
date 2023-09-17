import { isString } from '@nlib/typing';
import type { Properties } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import { toString as hastToString } from 'hast-util-to-string';
import { SKIP } from 'unist-util-visit';
import { visitHastElement } from '../rehype/visitHastElement.mts';

export type PageMetaData = Record<string, Array<string> | undefined>;

export const extractPageMetaDataFromHtml = (html: string): PageMetaData => {
  const data: PageMetaData = {};
  const set = (key: string | null, value: Properties[string]) => {
    if (!key) {
      return;
    }
    let list = data[key];
    if (!list) {
      list = data[key] = [];
    }
    if (Array.isArray(value)) {
      list.push(...value.map((v) => `${v}`));
    } else if (value) {
      list.push(`${value}`);
    }
  };
  visitHastElement(fromHtml(html), {
    title: (e) => {
      set('title', hastToString(e));
    },
    meta: (e) => {
      const {
        itemProp,
        property,
        name = property ?? itemProp,
        content,
      } = e.properties;
      set(stringify(name), content);
    },
    body: () => SKIP,
  });
  return data;
};

const stringify = (value: Properties[string]) => {
  if (Array.isArray(value)) {
    return value.join(' ');
  }
  return isString(value) ? value : null;
};
