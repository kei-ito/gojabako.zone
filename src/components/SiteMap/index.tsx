import { pageList } from '../../util/pageList.mts';
import type { Page } from '../../util/type.mts';
import * as style from './style.module.scss';

export const SiteMap = () => [...listGroups()];

interface PageGroup {
  name: string;
  pages: Array<Page>;
}

const listGroups = function* () {
  const flush = function* ({ name, pages }: PageGroup) {
    if (0 < pages.length) {
      yield <h2 key={name}>{name}</h2>;
      yield <PageList key={`${name}-pages`} pages={pages} />;
    }
  };
  const misc: PageGroup = { name: 'Others', pages: [] };
  let group: PageGroup = { name: '', pages: [] };
  for (const page of pageList) {
    const groupName = page.url.split('/')[0];
    if (isBlogGroupName(groupName)) {
      if (groupName !== group.name) {
        yield* flush(group);
        // eslint-disable-next-line require-atomic-updates
        group = { name: groupName, pages: [] };
      }
      group.pages.push(page);
    } else {
      misc.pages.push(page);
    }
  }
  yield* flush(group);
  yield* flush(misc);
};

const isBlogGroupName = (groupName: string) => /^\d{4,}$/.test(groupName);

const PageList = ({ pages }: { pages: Array<Page> }) => (
  <ul>
    {[
      ...(function* () {
        for (const page of pages) {
          const d = new Date(page.publishedAt);
          const date = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
          yield (
            <li key={page.url} className={style.page}>
              <a href={page.url}>
                <span>{page.title}</span>
                <time dateTime={page.publishedAt}>{date}公開</time>
              </a>
            </li>
          );
        }
      })(),
    ]}
  </ul>
);
