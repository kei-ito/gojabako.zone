import { isString } from '@nlib/typing';
import { EXIT, SKIP } from 'unist-util-visit';
import { IconClass } from '../classnames.mts';
import type { VFileLike } from '../unified.mts';
import { addClass } from './className.mts';
import {
  createFragmentTarget,
  createHastElement,
} from './createHastElement.mts';
import type { HastElementVisitor } from './visitHastElement.mts';
import { visitHastElement } from './visitHastElement.mts';

export const visitArticleLi =
  (_file: VFileLike, _tasks: Array<Promise<void>>): HastElementVisitor =>
  (li) => {
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
          createHastElement('span', { className: [IconClass] }, 'arrow_insert'),
        );
        return EXIT;
      },
    });
    li.children.unshift(createFragmentTarget(id));
    delete li.properties.id;
    return SKIP;
  };
