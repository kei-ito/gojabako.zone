import { isString } from '@nlib/typing';
import type { Root } from 'hast';
import { SKIP } from 'unist-util-visit';
import { getSingle } from '../util/getSingle.mts';
import type { VFileLike } from '../util/unified.mts';
import { createHastElement } from './createHastElement.mts';
import { hasClass } from './hasClass.mts';
import { insertArticleHeader } from './insertArticleHeader.mts';
import { insertFootnoteFocus } from './insertFootnoteFocus.mts';
import { insertLineNumbers } from './insertLineNumbers.mts';
import { isHastElement } from './isHastElement.mts';
import type { HastElementVisitor } from './visitHastElement.mts';
import { visitHastElement } from './visitHastElement.mts';

const rehypeArticle = () => (tree: Root, file: VFileLike) => {
  let codeBlockNumber = 0;
  visitHastElement(tree, {
    div: visitDiv,
    sup: visitSup,
    pre: (e, index, parent) => {
      const code = getSingle(e.children);
      if (!isHastElement(code, 'code', 'hljs')) {
        return null;
      }
      const value = code.data?.meta;
      const id = (code.properties.id = `C${++codeBlockNumber}`);
      insertLineNumbers(code, id);
      parent.children.splice(
        index,
        1,
        createHastElement(
          'figure',
          { dataType: 'code' },
          code,
          isString(value) && createHastElement('figcaption', {}, value),
        ),
      );
      return SKIP;
    },
  });
  insertArticleHeader(tree, file);
  return tree;
};

const visitDiv: HastElementVisitor = (e, index, parent) => {
  if (hasClass(e, 'math-display')) {
    parent.children.splice(
      index,
      1,
      createHastElement('figure', { dataType: 'math' }, ...e.children),
    );
    return SKIP;
  }
  return null;
};

const visitSup: HastElementVisitor = (e) => {
  const a = getSingle(e.children);
  if (!isHastElement(a, 'a') || !a.properties.dataFootnoteRef) {
    return null;
  }
  insertFootnoteFocus(e, a);
  return SKIP;
};

export default rehypeArticle;
