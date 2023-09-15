import type { HTMLAttributes } from 'react';
import { classnames } from '../../util/classnames.mjs';
import { pageList } from '../../util/pageList.mjs';
import type { Page } from '../../util/type.mjs';
import * as style from './style.module.scss';

export const SiteFooter = (props: HTMLAttributes<HTMLElement>) => (
  <footer {...props} className={classnames(style.container, props.className)}>
    <section>
      <PageGroups />
    </section>
    <section>
      <CopyRight />
    </section>
  </footer>
);

const PageGroups = () => (
  <>
    {[
      ...(function* () {
        let group: { name: string; pages: Array<Page> } = {
          name: '',
          pages: [],
        };
        const flush = function* (newGroupName: string) {
          if (0 < group.pages.length) {
            yield <h2 key={group.name}>{group.name}</h2>;
            yield <PageList key={`${group.name}-pages`} pages={group.pages} />;
          }
          // eslint-disable-next-line require-atomic-updates
          group = { name: newGroupName, pages: [] };
        };
        for (const page of pageList) {
          const groupName = page.url.split('/')[0];
          if (groupName !== group.name) {
            yield* flush(groupName);
          }
          group.pages.push(page);
        }
        yield* flush('');
      })(),
    ]}
  </>
);

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

const CopyRight = () => <div>© 2013- Kei Ito</div>;
