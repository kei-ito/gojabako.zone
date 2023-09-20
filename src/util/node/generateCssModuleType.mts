import { readFile, writeFile } from 'node:fs/promises';
import type { Root, AtRule, Rule } from 'postcss';
import { parse as parseScss } from 'postcss-scss';
import parseSelector from 'postcss-selector-parser';

export const generateCssModuleType = async (
  scssFilePath: string,
  localByDefault = true,
) => {
  const root = parseScss(await readFile(scssFilePath, 'utf-8'));
  const dest = `${scssFilePath}.d.ts`;
  await writeFile(dest, generateCode(listLocalNames(root, localByDefault)));
  return dest;
};

export const listLocalNames = function* (
  container: AtRule | Root | Rule,
  isLocal: boolean,
): Generator<string> {
  const yielded = new Set<string>();
  for (const selector of listSelectors(container)) {
    const root = parseSelector().astSync(selector, { lossless: false });
    for (const name of listLocalNamesInSelector(root, isLocal)) {
      if (!yielded.has(name)) {
        yield name;
        yielded.add(name);
      }
    }
  }
};

export const listSelectors = function* (
  container: AtRule | Root | Rule,
): Generator<string> {
  const selector = 'selector' in container ? container.selector.trim() : '';
  if (selector) {
    yield selector;
  }
  for (const child of container.nodes) {
    if ('nodes' in child) {
      for (const s of listSelectors(child)) {
        if (selector) {
          yield `${selector}${s.startsWith('&') ? s.slice(1) : ` ${s}`}`;
        } else {
          yield s;
        }
      }
    }
  }
};

// eslint-disable-next-line max-lines-per-function
export const listLocalNamesInSelector = function* (
  container: parseSelector.Container | parseSelector.Root,
  isLocal: boolean,
): Generator<string> {
  let currentIsLocal = isLocal;
  for (const node of container.nodes) {
    switch (node.type) {
      case 'root':
      case 'selector':
        yield* listLocalNamesInSelector(node, currentIsLocal);
        break;
      case 'class':
        if (currentIsLocal) {
          yield node.value;
        }
        break;
      case 'pseudo':
        switch (node.value) {
          case ':global':
            if (0 < node.nodes.length) {
              for (const c of node.nodes) {
                yield* listLocalNamesInSelector(c, false);
              }
            } else {
              currentIsLocal = false;
            }
            break;
          case ':local':
            if (0 < node.nodes.length) {
              for (const c of node.nodes) {
                yield* listLocalNamesInSelector(c, true);
              }
            } else {
              currentIsLocal = true;
            }
            break;
          default:
        }
        break;
      default:
    }
  }
};

const generateCode = (localNames: Iterable<string>) => {
  let code = '';
  for (const name of localNames) {
    code += `export declare const ${name}: string;\n`;
  }
  return code;
};
