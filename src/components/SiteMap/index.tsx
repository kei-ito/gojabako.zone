import { pageList } from '../../util/pageList.mts';
import type { PageData } from '../../util/type.mts';
import { PageLink } from '../PageLink';

export const SiteMap = () => [...listGroups()];

const listGroups = function* () {
  const others: Array<PageData> = [];
  let buffer: Array<PageData> = [];
  const flush = function* () {
    if (buffer.length === 0) {
      return;
    }
    const [{ group }] = buffer;
    yield <h2 key={group}>{group}</h2>;
    yield <PageList key={`${group}-pages`} pages={buffer} />;
    // eslint-disable-next-line require-atomic-updates
    buffer = [];
  };
  for (const page of pageList) {
    if (page.group) {
      if (page.group !== buffer[0]?.group) {
        yield* flush();
      }
      buffer.push(page);
    } else {
      others.push(page);
    }
  }
  yield* flush();
  if (0 < others.length) {
    others.sort((a, b) => a.path.localeCompare(b.path));
    yield <hr key="others-hr" />;
    yield <PageList key="others-pages" pages={others} />;
  }
};

const PageList = ({ pages }: { pages: Array<PageData> }) => (
  <ul>
    {[
      ...(function* () {
        for (const page of pages) {
          yield (
            <li key={page.path}>
              <PageLink page={page} />
            </li>
          );
        }
      })(),
    ]}
  </ul>
);
