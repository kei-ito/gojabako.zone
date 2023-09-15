import { writeFile } from 'fs/promises';
import { appDir, rootDir, srcDir } from '../util/node/directories.mjs';
import { getPageData } from '../util/node/getPageData.mjs';
import { walkFiles } from '../util/node/walkFiles.mjs';
import { serializeToJs } from '../util/serializeToJs.mjs';

const prefix = 'build/pageList:';

const listPageFiles = async function* (): AsyncGenerator<URL> {
  let count = 0;
  for await (const file of walkFiles(appDir)) {
    if (/\.page\.\w+$/.test(file.pathname)) {
      count += 1;
      yield file;
    }
  }
  console.info(prefix, `${count} pages`);
};

const generateCode = async function* () {
  yield "import type { Page } from './type.mjs';\n";
  yield 'export const pageList: Array<Page> = [\n';
  for await (const file of listPageFiles()) {
    console.info(prefix, file.pathname.slice(appDir.pathname.length));
    const page = await getPageData(file);
    yield '  ';
    yield* serializeToJs(page, 1);
    yield ',\n';
  }
  yield '];\n';
};

let code = '';
for await (const chunk of generateCode()) {
  code += chunk;
}
const dest = new URL('util/pageList.mts', srcDir);
await writeFile(dest, code);
console.info(prefix, 'done', dest.pathname.slice(rootDir.pathname.length));
