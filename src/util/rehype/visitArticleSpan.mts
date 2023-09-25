import { SKIP } from 'unist-util-visit';
import type { VFileLike } from '../unified.mts';
import { addClass, hasClass } from './className.mts';
import { getKatexHtml } from './getKatexHtml.mts';
import type { HastElementVisitor } from './visitHastElement.mts';

export const visitArticleSpan =
  (_file: VFileLike, _tasks: Array<Promise<void>>): HastElementVisitor =>
  (div, index, parent) => {
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
