import { readFile } from 'node:fs/promises';
import { isNonNegativeSafeInteger, isObject, isString } from '@nlib/typing';
import type { Element, Root } from 'hast';
import type { MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import type { Position } from 'unist';
import { EXIT, SKIP } from 'unist-util-visit';
import { ClassIcon } from '../util/classnames.mts';
import { getSingle } from '../util/getSingle.mts';
import { mdToInlineHast } from '../util/node/mdToHast.mts';
import type { VFileLike } from '../util/unified.mts';
import { addClass, hasClass } from './className.mts';
import { createHastElement } from './createHastElement.mts';
import { createMdxEsm } from './createMdxJsEsm.mts';
import { createMdxJsxTextElement } from './createMdxJsxTextElement.mts';
import { insertArticleData } from './insertArticleData.mts';
import { insertLineNumbers } from './insertLineNumbers.mts';
import { isHastElement } from './isHastElement.mts';
import { serializePropertyValue } from './serializePropertyValue.mts';
import type { HastElementVisitor } from './visitHastElement.mts';
import { visitHastElement } from './visitHastElement.mts';

export const rehypeArticle = () => async (tree: Root, file: VFileLike) => {
  const tasks: Array<Promise<void>> = [];
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
    img: visitImg(file, tasks),
  });
  await Promise.all(tasks);
  insertArticleData(tree, file);
  return tree;
};

const visitSpan: HastElementVisitor = (div, index, parent) => {
  if (hasClass(div, 'math-inline')) {
    const katexHtml = getKatexHtml(div);
    if (!katexHtml) {
      return null;
    }
    addClass(katexHtml, 'katex', 'katex-html', 'math-inline');
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
      addClass(katexHtml, 'katex', 'katex-html');
      const id = `math${++mathCount}`;
      parent.children.splice(
        index,
        1,
        createHastElement(
          'figure',
          { dataType: 'math' },
          createHastElement('span', { id, className: ['fragment-target'] }),
          createHastElement(
            'figcaption',
            {},
            createHastElement('span', {}),
            createFragmentRef(id),
          ),
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
  addClass(e, 'footnote-ref');
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
      addClass(a, 'footnote-backref');
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
    createFragmentRef(id),
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
    const id = `code${++count}`;
    insertLineNumbers(code, id);
    parent.children.splice(
      index,
      1,
      createHastElement(
        'figure',
        {
          dataType: 'code',
          ...(isString(value) ? { className: ['caption'] } : {}),
        },
        createHastElement('span', { id, className: ['fragment-target'] }),
        createHastElement(
          'figcaption',
          {},
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
          createFragmentRef(id),
        ),
        code,
      ),
    );
    return SKIP;
  };
};

const visitTable = (): HastElementVisitor => {
  let tableCount = 0;
  return (e, index, parent) => {
    const id = `table${++tableCount}`;
    parent.children.splice(
      index,
      1,
      createHastElement(
        'figure',
        { dataType: 'table' },
        createHastElement('span', { id, className: ['fragment-target'] }),
        createHastElement(
          'figcaption',
          {},
          createHastElement('span', {}),
          createFragmentRef(id),
        ),
        e,
      ),
    );
    return SKIP;
  };
};

const visitImg = (
  file: VFileLike,
  tasks: Array<Promise<void>>,
): HastElementVisitor => {
  let imageCount = 0;
  const imported = new Map<string, string>();
  let sourcePromise: Promise<string> | undefined;
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
    const id = `img${++imageCount}`;
    let name = imported.get(src);
    if (!name) {
      name = `_${id}`;
      imported.set(src, name);
      elements.push(createMdxEsm(`import ${name} from '${src}';`));
    }
    if (isHastElement(parent, 'p') && parent.children.length === 1) {
      const alt = createHastElement('span', {});
      if (e.position) {
        sourcePromise = sourcePromise ?? readFile(file.path, 'utf8');
        tasks.push(parseAlt(parent, alt, sourcePromise, e.position));
      }
      parent.tagName = 'figure';
      parent.properties.dataType = 'image';
      elements.push(
        createHastElement('span', { id, className: ['fragment-target'] }),
        createHastElement('figcaption', {}, alt, createFragmentRef(id)),
      );
    }
    elements.push(
      createMdxJsxTextElement('Image', {
        src: [name],
        alt: serializePropertyValue(e.properties.alt),
      }),
    );
    parent.children.splice(index, 1, ...elements);
    return [SKIP, index + elements.length];
  };
};

const parseAlt = async (
  parent: Element,
  alt: Element,
  sourcePromise: Promise<string>,
  { start: { offset: start }, end: { offset: end } }: Position,
) => {
  if (!(isNonNegativeSafeInteger(start) && isNonNegativeSafeInteger(end))) {
    return;
  }
  const matched = /!\[(.*)\]\(.*?\)/.exec(
    (await sourcePromise).slice(start, end),
  );
  if (!matched) {
    return;
  }
  const children = [...mdToInlineHast(matched[1])];
  alt.children.push(...children);
  if (0 < children.length) {
    addClass(parent, 'caption');
  }
};

const createFragmentRef = (id: string) =>
  createHastElement('a', {
    href: `#${id}`,
    className: ['fragment-ref'],
  });
