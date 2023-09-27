import * as console from 'node:console';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { watch } from 'chokidar';
import { componentsDir, rootDir, srcDir } from '../util/node/directories.mts';
import { formatCode } from '../util/node/formatCode.mts';
import { walkFiles } from '../util/node/walkFiles.mts';
import { noop } from '../util/noop.mts';

const dest = new URL('Storybook/all.mts', componentsDir);
const storySuffix = '/index.stories.tsx';
const storyFiles = new Set<string>();
const componentsDirPath = fileURLToPath(componentsDir);

const onError = (error: unknown) => {
  console.error(error);
};

const generate = async () => {
  let code = "import type { StoryObj } from '@storybook/react';";
  let count = 0;
  const groupNames = new Map<string, string>();
  for (const filePath of [...storyFiles].sort((a, b) => a.localeCompare(b))) {
    const relativePath = filePath.slice(componentsDirPath.length);
    const name = `g${++count}`;
    groupNames.set(relativePath.slice(0, -storySuffix.length), name);
    const source = `../${relativePath}`.replace(/\.tsx?$/, '');
    code += `import * as ${name} from '${source}';`;
  }
  code += 'type Stories = Record<string, StoryObj>;';
  code += 'export const storyGroups = new Map<string, Stories>();';
  for (const [relativePath, name] of groupNames) {
    code += `storyGroups.set('${relativePath}', ${name} as Stories);`;
  }
  await writeFile(dest, await formatCode(code));
  console.info(`Generated ${dest.pathname.slice(rootDir.pathname.length)}`);
  return dest;
};

if (process.argv.includes('--watch')) {
  let timerId = setTimeout(noop);
  const update = () => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      generate().catch(onError);
    }, 100);
  };
  const onChange = (filePath: string) => {
    if (filePath.endsWith(storySuffix)) {
      storyFiles.add(filePath);
      update();
    }
  };
  const onUnlink = (filePath: string) => {
    if (filePath.endsWith(storySuffix)) {
      storyFiles.delete(filePath);
      update();
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
