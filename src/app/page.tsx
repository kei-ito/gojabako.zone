import type { Metadata } from "next";
import Link from "next/link";
import { Article } from "../components/Article";
import { PageLink } from "../components/PageLink";
import { SiteLayout } from "../components/SiteLayout";
import { pageList } from "../util/pageList.ts";
import { site } from "../util/site.ts";

export const metadata: Metadata = {};

export default function Page() {
  return (
    <SiteLayout>
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
    </SiteLayout>
  );
}

const listRecentPages = function* (limit: number) {
  for (const page of pageList
    .slice()
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit)) {
    yield (
      <li key={page.path}>
        <PageLink page={page} />
      </li>
    );
  }
};
