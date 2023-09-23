import type { Metadata } from 'next';
import Link from 'next/link';
import { Article } from '../components/Article';
import { PageLink } from '../components/PageLink';
import { pageList } from '../util/pageList.mts';
import { site } from '../util/site.mts';

export const metadata: Metadata = {};

export default function Page() {
  return (
    <main>
      <Article>
        <header>
          <h1>{site.name}</h1>
        </header>
        <p>
          <Link href="/author">{site.author.name}</Link> のサイトです。
        </p>
        <h2>最近の更新</h2>
        <ul>{[...listRecentPages(10)]}</ul>
      </Article>
    </main>
  );
}

const listRecentPages = function* (limit: number) {
  let count = 0;
  for (const page of pageList) {
    yield (
      <li key={page.path}>
        <PageLink page={page} />
      </li>
    );
    if (!(++count < limit)) {
      break;
    }
  }
};
