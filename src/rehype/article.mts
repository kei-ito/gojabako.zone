import { isObject, isString } from '@nlib/typing';
import type { Element, Root } from 'hast';
import type { MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import { EXIT, SKIP } from 'unist-util-visit';
import { ClassIcon } from '../util/classnames.mts';
import { getSingle } from '../util/getSingle.mts';
import { mdToInlineHast } from '../util/node/mdToHast.mts';
import type { VFileLike } from '../util/unified.mts';
import { createHastElement } from './createHastElement.mts';
import { createMdxEsm } from './createMdxJsEsm.mts';
import { createMdxJsxTextElement } from './createMdxJsxTextElement.mts';
import { hasClass } from './hasClass.mts';
import { insertArticleData } from './insertArticleData.mts';
import { insertLineNumbers } from './insertLineNumbers.mts';
import { isHastElement } from './isHastElement.mts';
import { serializePropertyValue } from './serializePropertyValue.mts';
import type { HastElementVisitor } from './visitHastElement.mts';
import { visitHastElement } from './visitHastElement.mts';

export const rehypeArticle = () => (tree: Root, file: VFileLike) => {
  visitHastElement(tree, {
    div: visitDiv(),
    span: visitSpan,
    sup: visitSup,
    li: visitLi,
    h1: visitHeading,
    h2: visitHeading,
    h3: visitHeading,
    h4: visitHeading,
    h5: visitHeading,
    h6: visitHeading,
    pre: visitPre(),
    table: visitTable(),
    img: visitImg(),
  });
  insertArticleData(tree, file);
  return tree;
};

const visitSpan: HastElementVisitor = (div, index, parent) => {
  if (hasClass(div, 'math-inline')) {
    const katexHtml = getKatexHtml(div);
    if (!katexHtml) {
      return null;
    }
    katexHtml.properties.className = ['katex', 'katex-html', 'math-inline'];
    parent.children.splice(index, 1, katexHtml);
    return SKIP;
  }
  return null;
};

const visitDiv = (): HastElementVisitor => {
  let mathCount = 0;
  return (div, index, parent) => {
    if (hasClass(div, 'math-display')) {
      const katexHtml = getKatexHtml(div);
      if (!katexHtml) {
        return null;
      }
      katexHtml.properties.className = ['katex', 'katex-html'];
      const id = `eq${++mathCount}`;
      parent.children.splice(
        index,
        1,
        createHastElement(
          'figure',
          { dataType: 'math' },
          createHastElement('span', { id, className: ['fragment-target'] }),
          createHastElement('a', {
            href: `#${id}`,
            className: ['fragment-ref'],
          }),
          katexHtml,
        ),
      );
      return SKIP;
    }
    return null;
  };
};

const getKatexHtml = (element: Element) => {
  let katexHtml: Element | undefined;
  visitHastElement(element, {
    span: (span) => {
      if (hasClass(span, 'katex-html')) {
        katexHtml = span;
        return EXIT;
      }
      return null;
    },
  });
  return katexHtml;
};

const visitSup: HastElementVisitor = (e) => {
  const a = getSingle(e.children);
  if (!isHastElement(a, 'a') || !a.properties.dataFootnoteRef) {
    return null;
  }
  e.properties.className = ['footnote-ref'];
  e.children.unshift(
    createHastElement('span', {
      id: a.properties.id,
      className: ['fragment-target'],
    }),
  );
  delete a.properties.id;
  delete a.properties.dataFootnoteRef;
  return SKIP;
};

const visitLi: HastElementVisitor = (li) => {
  const { id } = li.properties;
  const idPrefix = 'user-content-fn-';
  if (!isString(id) || !id.startsWith(idPrefix)) {
    return null;
  }
  visitHastElement(li, {
    a: (a) => {
      if (!a.properties.dataFootnoteBackref) {
        return null;
      }
      delete a.properties.dataFootnoteBackref;
      a.properties.className = ['footnote-backref'];
      a.children.splice(
        0,
        a.children.length,
        createHastElement('span', { className: [ClassIcon] }, 'arrow_insert'),
      );
      return EXIT;
    },
  });
  li.children.unshift(
    createHastElement('span', { id, className: ['fragment-target'] }),
  );
  delete li.properties.id;
  return SKIP;
};

const visitHeading: HastElementVisitor = (e) => {
  const { id } = e.properties;
  if (!isString(id)) {
    return null;
  }
  e.children.unshift(
    createHastElement('span', { id, className: ['fragment-target'] }),
    createHastElement('a', { href: `#${id}`, className: ['fragment-ref'] }),
  );
  delete e.properties.id;
  return SKIP;
};

const visitPre = (): HastElementVisitor => {
  let count = 0;
  return (e, index, parent) => {
    const code = getSingle(e.children);
    if (!isHastElement(code, 'code', 'hljs')) {
      return null;
    }
    let language =
      code.properties.className.find((c) => c.startsWith('language-')) ?? '';
    language = language.slice('language-'.length);
    const value = isObject(code.data) && code.data.meta;
    const id = `C${++count}`;
    insertLineNumbers(code, id);
    parent.children.splice(
      index,
      1,
      createHastElement(
        'figure',
        { dataType: 'code' },
        createHastElement('span', { id, className: ['fragment-target'] }),
        createHastElement(
          'figcaption',
          isString(value) ? {} : { className: ['nocaption'] },
          createHastElement(
            'span',
            {},
            ...(isString(value) ? mdToInlineHast(value) : []),
          ),
          createHastElement(
            'span',
            { className: ['language-label'] },
            language,
          ),
          createHastElement('a', {
            href: `#${id}`,
            className: ['fragment-ref'],
          }),
        ),
        code,
      ),
    );
    return SKIP;
  };
};

const visitTable = (): HastElementVisitor => {
  let count = 0;
  return (e, index, parent) => {
    parent.children.splice(
      index,
      1,
      createHastElement(
        'figure',
        { id: `table${++count}`, dataType: 'table' },
        e,
      ),
    );
    return SKIP;
  };
};

const visitImg = (): HastElementVisitor => {
  let imageCount = 0;
  const imported = new Map<string, string>();
  return (e, index, parent) => {
    const { src } = e.properties;
    if (!isString(src)) {
      return null;
    }
    if (!src.startsWith('./')) {
      throw new Error(`InvalidSrc: ${src}`);
    }
    const elements: Array<Element | MdxJsxTextElement> = [];
    if (imageCount === 0) {
      elements.push(createMdxEsm(`import Image from 'next/image';`));
    }
    const id = `image${++imageCount}`;
    let name = imported.get(src);
    if (!name) {
      name = `_${id}`;
      imported.set(src, name);
      elements.push(createMdxEsm(`import ${name} from '${src}';`));
    }
    const alt = serializePropertyValue(e.properties.alt);
    if (isHastElement(parent, 'p') && parent.children.length === 1) {
      parent.tagName = 'figure';
      parent.properties.id = id;
      parent.properties.dataType = 'image';
      if (alt) {
        elements.push(createHastElement('figcaption', {}, alt));
      }
    }
    elements.push(createMdxJsxTextElement('Image', { src: [name], alt }));
    parent.children.splice(index, 1, ...elements);
    return [SKIP, index + elements.length];
  };
};
