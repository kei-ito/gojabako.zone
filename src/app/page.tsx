import type { Metadata } from 'next';
import Link from 'next/link';
import { Article } from '../components/Article';
import { PageLink } from '../components/PageLink';
import { pageList } from '../util/pageList.mts';
import { site } from '../util/site.mts';
import type { PageData } from '../util/type.mts';

export const metadata: Metadata = {};

export default function Page() {
  return (
    <Article>
      <header>
        <h1>{site.name}</h1>
      </header>
      <p>
        <Link href="/author">{site.author.name}</Link> のサイトです。
      </p>
      <h1>最近の更新</h1>
      <ul>{[...listRecentUpdates(10)]}</ul>
    </Article>
  );
}

const listRecentUpdates = function* (limit: number) {
  let count = 0;
  for (const page of pageList.slice().sort(byUpdatedAt)) {
    yield (
      <li key={page.path}>
        <PageLink page={page} mode="update" />
      </li>
    );
    if (!(++count < limit)) {
      break;
    }
  }
};

const byUpdatedAt = (a: PageData, b: PageData) => {
  return a.updatedAt.localeCompare(b.updatedAt);
};
