import * as console from 'node:console';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { watch } from 'chokidar';
import { componentsDir, rootDir, srcDir } from '../util/node/directories.mts';
import { walkFiles } from '../util/node/walkFiles.mts';

const dest = new URL('Storybook/all.mts', componentsDir);
const storySuffix = '/index.stories.tsx';
const storyFiles = new Set<string>();
const componentsDirPath = fileURLToPath(componentsDir);

const onError = (error: unknown) => {
  console.error(error);
};

const generate = async () => {
  const used = new Set<string>();
  let code = '';
  for (const filePath of [...storyFiles].sort((a, b) => a.localeCompare(b))) {
    const relativePath = filePath.slice(componentsDirPath.length);
    let name = relativePath.slice(0, -storySuffix.length);
    name = name.split('/').join('_');
    if (used.has(name)) {
      let count = 1;
      while (used.has(`${name}${count}`)) {
        count++;
      }
      name = `${name}${count}`;
    }
    const source = `../${relativePath}`.replace(/\.tsx?$/, '');
    code += `import * as ${name} from '${source}';\n`;
    code += `export { ${name} };\n`;
  }
  await writeFile(dest, code);
  console.info(`Generated ${dest.pathname.slice(rootDir.pathname.length)}`);
  return dest;
};

if (process.argv.includes('--watch')) {
  const onChange = (filePath: string) => {
    if (filePath.endsWith(storySuffix)) {
      storyFiles.add(filePath);
      generate().catch(onError);
    }
  };
  const onUnlink = (filePath: string) => {
    if (filePath.endsWith(storySuffix)) {
      storyFiles.delete(filePath);
      generate().catch(onError);
    }
  };
  watch(fileURLToPath(srcDir), { ignoreInitial: false })
    .on('add', onChange)
    .on('change', onChange)
    .on('unlink', onUnlink);
} else {
  for await (const file of walkFiles(componentsDir)) {
    const filePath = fileURLToPath(file);
    if (filePath.endsWith(storySuffix)) {
      storyFiles.add(filePath);
    }
  }
  await generate();
}
