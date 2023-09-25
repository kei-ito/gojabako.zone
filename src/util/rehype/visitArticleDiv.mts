import { SKIP } from 'unist-util-visit';
import type { VFileLike } from '../unified.mts';
import { addClass, hasClass } from './className.mts';
import {
  createFragmentRef,
  createFragmentTarget,
  createHastElement,
} from './createHastElement.mts';
import { getKatexHtml } from './getKatexHtml.mts';
import { isHastElement } from './isHastElement.mts';
import type { HastElementVisitor } from './visitHastElement.mts';
import { visitHastElement } from './visitHastElement.mts';

export const visitArticleDiv = (
  _file: VFileLike,
  _tasks: Array<Promise<void>>,
): HastElementVisitor => {
  let mathCount = 0;
  let equationCount = 0;
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
          createFragmentTarget(id),
          createHastElement(
            'figcaption',
            {},
            createHastElement('span', {}),
            createFragmentRef(id),
          ),
          katexHtml,
        ),
      );
      visitHastElement(div, {
        span: (e) => {
          if (isHastElement(e, 'span', 'eqn-num')) {
            const equationId = `eq${++equationCount}`;
            e.children.push(
              createFragmentTarget(equationId),
              createFragmentRef(equationId, `(${equationCount})`),
            );
          }
        },
      });
      return SKIP;
    }
    return null;
  };
};
