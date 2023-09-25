import { readFile } from 'node:fs/promises';
import { isNonNegativeSafeInteger, isString } from '@nlib/typing';
import type { Element } from 'hast';
import type { MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import type { Position } from 'unist';
import { SKIP } from 'unist-util-visit';
import { mdToInlineHast } from '../node/mdToHast.mts';
import type { VFileLike } from '../unified.mts';
import { addClass } from './className.mts';
import {
  createFragmentRef,
  createFragmentTarget,
  createHastElement,
} from './createHastElement.mts';
import { createMdxEsm } from './createMdxJsEsm.mts';
import { createMdxJsxTextElement } from './createMdxJsxTextElement.mts';
import { isHastElement } from './isHastElement.mts';
import { serializePropertyValue } from './serializePropertyValue.mts';
import type { HastElementVisitor } from './visitHastElement.mts';

export const visitArticleImg = (
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
        createFragmentTarget(id),
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
