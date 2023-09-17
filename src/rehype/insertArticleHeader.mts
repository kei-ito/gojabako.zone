import { pathToFileURL } from 'node:url';
import type { Element, Root } from 'hast';
import { getPageFromFileUrl } from '../util/getPage.mts';
import type { PageData } from '../util/type.mts';
import type { VFileLike } from '../util/unified.mts';
import { createHastElement } from './createHastElement.mts';

export const insertArticleHeader = (root: Root, file: VFileLike) => {
  const page = getPageFromFileUrl(pathToFileURL(file.path));
  root.children.unshift(
    createHastElement(
      'header',
      {},
      createHastElement('h1', {}, page.title),
      createHastElement('div', {}, ...listMetaElements(page)),
    ),
  );
};

const listMetaElements = function* (
  page: PageData,
): Generator<Element | string> {
  yield createHastElement(
    'span',
    { title: page.publishedAt },
    createHastElement(
      'time',
      { dateTime: page.publishedAt },
      toDateString(page.publishedAt),
    ),
    'に公開',
  );
  if (page.publishedAt !== page.updatedAt) {
    yield createHastElement(
      'span',
      { title: page.updatedAt },
      '（',
      createHastElement(
        'time',
        { dateTime: page.updatedAt },
        toDateString(page.updatedAt),
      ),
      'に更新）',
    );
  }
  if (1 < page.commits) {
    yield createHastElement(
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
