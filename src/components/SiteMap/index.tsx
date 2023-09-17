import { pageList } from '../../util/pageList.mts';
import type { PageData } from '../../util/type.mts';
import { PageLink } from '../PageLink';

export const SiteMap = () => [...listGroups()];

interface PageGroup {
  name: string;
  pages: Array<PageData>;
}

const listGroups = function* () {
  const flush = function* ({ name, pages }: PageGroup) {
    if (0 < pages.length) {
      yield <h2 key={name}>{name}</h2>;
      yield <PageList key={`${name}-pages`} pages={pages} />;
    }
  };
  const others: PageGroup = { name: '', pages: [] };
  let group: PageGroup = { name: '', pages: [] };
  for (const page of pageList) {
    const groupName = page.url.split('/')[1];
    if (isBlogGroupName(groupName)) {
      if (groupName !== group.name) {
        yield* flush(group);
        // eslint-disable-next-line require-atomic-updates
        group = { name: groupName, pages: [] };
      }
      group.pages.push(page);
    } else {
      others.pages.push(page);
    }
  }
  yield* flush(group);
  if (0 < others.pages.length) {
    yield <hr key="others-hr" />;
    yield <PageList key="others-pages" pages={others.pages} />;
  }
};

const isBlogGroupName = (groupName: string) => /^\d{4,}$/.test(groupName);

const PageList = ({ pages }: { pages: Array<PageData> }) => (
  <ul>
    {[
      ...(function* () {
        for (const page of pages) {
          yield (
            <li key={page.url}>
              <PageLink page={page} />
            </li>
          );
        }
      })(),
    ]}
  </ul>
);
