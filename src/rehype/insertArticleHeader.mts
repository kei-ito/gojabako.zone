import { pathToFileURL } from 'node:url';
import type { Element, Root } from 'hast';
import { getPageFromFileUrl } from '../util/getPage.mts';
import type { Page } from '../util/type.mts';
import { createRehypeElement } from './createRehypeElement.mts';

export const insertArticleHeader = (root: Root, file: { path: string }) => {
  if (0 < root.children.length) {
    const [firstChild] = root.children;
    if (firstChild.type === 'element' && firstChild.tagName === 'h1') {
      root.children.splice(0, 1);
    }
  }
  const page = getPageFromFileUrl(pathToFileURL(file.path));
  root.children.unshift(
    createRehypeElement(
      'header',
      {},
      createRehypeElement('h1', {}, page.title),
      createRehypeElement('div', {}, ...listMetaElements(page)),
    ),
  );
};

const listMetaElements = function* (page: Page): Generator<Element | string> {
  yield createRehypeElement(
    'span',
    { title: page.publishedAt },
    createRehypeElement(
      'time',
      { dateTime: page.publishedAt },
      toDateString(page.publishedAt),
    ),
    'に公開',
  );
  if (page.publishedAt !== page.updatedAt) {
    yield createRehypeElement(
      'span',
      { title: page.updatedAt },
      '（',
      createRehypeElement(
        'time',
        { dateTime: page.updatedAt },
        toDateString(page.updatedAt),
      ),
      'に更新）',
    );
  }
  if (1 < page.commits) {
    yield createRehypeElement(
      'a',
      {
        href: `https://github.com/gjbkz/gojabako.zone/commits/main/${page.filePath}`,
      },
      `履歴 (${page.commits})`,
    );
  }
};

const toDateString = (src: string) => {
  const d = new Date(src);
  let result = '';
  result += d.getFullYear();
  result += '/';
  result += d.getMonth() + 1;
  result += '/';
  result += d.getDate();
  return result;
};
