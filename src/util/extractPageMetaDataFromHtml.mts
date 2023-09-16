import { isString } from '@nlib/typing';
import type { Properties } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import rehypeParse from 'rehype-parse';
import { unified } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

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
  visit(
    unified().use(rehypeParse, { fragment: true }).parse(html),
    'element',
    (e) => {
      switch (e.tagName) {
        case 'title':
          set('title', hastToString(e));
          break;
        case 'meta': {
          const {
            itemProp,
            property,
            name = property ?? itemProp,
            content,
          } = e.properties;
          set(stringify(name), content);
          break;
        }
        case 'body':
          return SKIP;
        default:
      }
      return null;
    },
  );
  return data;
};

const stringify = (value: Properties[string]) => {
  if (Array.isArray(value)) {
    return value.join(' ');
  }
  return isString(value) ? value : null;
};
