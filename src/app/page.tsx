import { Article } from '../components/Article';
import { PageLink } from '../components/PageLink';
import { pageList } from '../util/pageList.mts';
import type { PageData } from '../util/type.mts';

export default function Page() {
  return (
    <Article>
      <h1>最近の更新</h1>
      <ul>{[...listRecentUpdates(10)]}</ul>
    </Article>
  );
}

const listRecentUpdates = function* (limit: number) {
  let count = 0;
  for (const page of pageList.sort(byUpdatedAt)) {
    yield (
      <li key={page.url}>
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
