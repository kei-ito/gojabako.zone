import { writeFile } from 'fs/promises';
import { appDir, rootDir, srcDir } from '../util/node/directories.mjs';
import { walkFiles } from '../util/node/walkFiles.mjs';
import { listCommits } from '../util/node/listCommits.mjs';

const generateCode = async function* () {
  yield "import type { Page } from './type.mjs';\n";
  yield 'export const pageList: Array<Page> = [\n';
  for await (const file of walkFiles(appDir)) {
    console.info(file.pathname.slice(rootDir.pathname.length));
    if (/\.page\.\w+$/.test(file.pathname)) {
      yield '  {\n';
      {
        let url = file.pathname.slice(appDir.pathname.length);
        url = url.replace(/(\/index)?\.page\.\w+$/, '');
        yield `    url: '${url}',\n`;
      }
      {
        const relativePath = file.pathname.slice(rootDir.pathname.length);
        yield `    filePath: '${relativePath}',\n`;
        let publishedAt = new Date().toISOString();
        let updatedAt = '';
        let commits = 0;
        for await (const { aDate } of listCommits(relativePath)) {
          commits += 1;
          if (!updatedAt) {
            updatedAt = aDate;
          }
          publishedAt = aDate;
        }
        yield `    publishedAt: '${publishedAt}',\n`;
        yield `    updatedAt: '${updatedAt || publishedAt}',\n`;
        yield `    commits: ${commits},\n`;
      }
      yield '  },\n';
    }
  }
  yield '];\n';
};

let code = '';
for await (const chunk of generateCode()) {
  code += chunk;
}
const dest = new URL('util/pageList.mts', srcDir);
await writeFile(dest, code);
