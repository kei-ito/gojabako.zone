import { writeFile } from 'node:fs/promises';
import { appDir, rootDir, srcDir } from '../util/node/directories.mts';
import { getPageData } from '../util/node/getPageData.mts';
import { walkFiles } from '../util/node/walkFiles.mts';
import { serializeToJs } from '../util/serializeToJs.mts';
import type { PageData } from '../util/type.mts';

const prefix = 'build/pageList:';

const listPageFiles = async function* (): AsyncGenerator<URL> {
  let count = 0;
  for await (const file of walkFiles(appDir)) {
    if (/\/page\.\w+$/.test(file.pathname)) {
      count += 1;
      yield file;
    }
  }
  console.info(prefix, `${count} pages`);
};

const generateCode = async function* () {
  const pageList: Array<PageData> = [];
  for await (const file of listPageFiles()) {
    console.info(prefix, file.pathname.slice(appDir.pathname.length));
    pageList.push(await getPageData(file));
  }
  pageList.sort((a, b) => {
    const ga = a.url.split('/', 1)[0];
    const gb = b.url.split('/', 1)[0];
    if (ga === gb) {
      const ta = new Date(a.publishedAt).getTime();
      const tb = new Date(b.publishedAt).getTime();
      return tb - ta;
    }
    return gb.localeCompare(ga);
  });
  yield "import type { PageData } from './type.mts';\n";
  yield 'export const pageList: Array<PageData> = ';
  yield* serializeToJs(pageList);
  yield ';\n';
};

let code = '';
for await (const chunk of generateCode()) {
  code += chunk;
}
const dest = new URL('util/pageList.mts', srcDir);
await writeFile(dest, code);
console.info(prefix, 'done', dest.pathname.slice(rootDir.pathname.length));
