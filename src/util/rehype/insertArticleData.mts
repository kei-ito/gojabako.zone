import { pathToFileURL } from 'node:url';
import { isString } from '@nlib/typing';
import type { Element, Root, RootContent } from 'hast';
import type { MdxjsEsm } from 'mdast-util-mdxjs-esm';
import { getPageFromFileUrl } from '../getPage.mts';
import { site } from '../site.mts';
import type { PageData } from '../type.mts';
import type { VFileLike } from '../unified.mts';
import { createHastElement } from './createHastElement.mts';
import { setOpenGraphMetadata } from './setOpenGraphMetadata.mts';

interface RootLike extends Omit<Root, 'children'> {
  children: Array<MdxjsEsm | RootContent>;
}

export const insertArticleData = (root: RootLike, file: VFileLike) => {
  const page = getPageFromFileUrl(pathToFileURL(file.path));
  if (page) {
    setOpenGraphMetadata(root, page);
    root.children.unshift(
      createHastElement(
        'header',
        {},
        createHastElement('h1', {}, page.title.join('')),
        createHastElement('div', {}, ...listMetaElements(page)),
      ),
    );
  }
};

const getOriginalLocation = (page: PageData) => {
  if (isString(page.other?.originalLocation)) {
    return page.other.originalLocation;
  }
  return null;
};

const listMetaElements = function* (
  page: PageData,
): Generator<Element | string> {
  const originalLocation = getOriginalLocation(page);
  yield createHastElement(
    'span',
    { title: page.publishedAt },
    createHastElement(
      'time',
      { dateTime: page.publishedAt },
      toDateString(page.publishedAt),
    ),
    originalLocation ? `に ${originalLocation} で公開` : 'に公開',
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
        href: new URL(`commits/main/${page.filePath}`, site.repositoryUrl).href,
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
