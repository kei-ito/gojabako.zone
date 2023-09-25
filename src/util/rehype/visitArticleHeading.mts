import { isString } from '@nlib/typing';
import { SKIP } from 'unist-util-visit';
import type { VFileLike } from '../unified.mts';
import {
  createFragmentRef,
  createFragmentTarget,
} from './createHastElement.mts';
import type { HastElementVisitor } from './visitHastElement.mts';

export const visitArticleHeading =
  (_file: VFileLike, _tasks: Array<Promise<void>>): HastElementVisitor =>
  (e) => {
    const { id } = e.properties;
    if (!isString(id)) {
      return null;
    }
    e.children.unshift(createFragmentTarget(id), createFragmentRef(id));
    delete e.properties.id;
    return SKIP;
  };
