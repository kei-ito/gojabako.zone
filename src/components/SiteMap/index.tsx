import { pageList } from "../../util/pageList.ts";
import type { PageData } from "../../util/type.ts";
import { PageLink } from "../PageLink";

export const SiteMap = () => [...listGroups()];

const listGroups = function* () {
  const apps: Array<PageData> = [];
  const others: Array<PageData> = [];
  let buffer: Array<PageData> = [];
  const flush = function* () {
    if (buffer.length === 0) {
      return;
    }
    const [{ group }] = buffer;
    yield <h2 key={`${group}-heading`}>{group}</h2>;
    yield <PageList key={`${group}-pages`} pages={buffer} />;
    buffer = [];
  };
  for (const page of pageList) {
    if (page.group) {
      if (/^app(\/|$)/.test(page.group)) {
        apps.push(page);
      } else {
        if (page.group !== buffer[0]?.group) {
          yield* flush();
        }
        buffer.push(page);
      }
    } else {
      others.push(page);
    }
  }
  yield* flush();
  if (0 < apps.length) {
    yield <hr key="apps-hr" />;
    yield <h2 key="apps">App</h2>;
    yield <PageList key="apps-pages" pages={apps} showDescription />;
  }
  if (0 < others.length) {
    others.sort((a, b) => a.path.localeCompare(b.path));
    yield <hr key="others-hr" />;
    yield <PageList key="others-pages" pages={others} />;
  }
};

interface PageListProps {
  pages: Array<PageData>;
  showDescription?: boolean;
}

const PageList = ({ pages, showDescription }: PageListProps) => (
  <ul>
    {[
      ...(function* () {
        for (const page of pages) {
          yield (
            <li key={page.path}>
              <PageLink page={page} showDescription={showDescription} />
            </li>
          );
        }
      })(),
    ]}
  </ul>
);
