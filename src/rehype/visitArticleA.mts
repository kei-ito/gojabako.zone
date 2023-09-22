import { SKIP } from 'unist-util-visit';
import { site } from '../util/site.mts';
import type { VFileLike } from '../util/unified.mts';
import { serializePropertyValue } from './serializePropertyValue.mts';
import type { HastElementVisitor } from './visitHastElement.mts';

export const visitArticleA =
  (_file: VFileLike, _tasks: Array<Promise<void>>): HastElementVisitor =>
  (a) => {
    const href = serializePropertyValue(a.properties.href);
    if (/^\w+:\/\//.test(href) && !href.startsWith(site.baseUrl.href)) {
      a.properties.target = '_blank';
    }
    return SKIP;
  };
