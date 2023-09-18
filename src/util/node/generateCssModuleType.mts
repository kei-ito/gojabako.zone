import { readFile, writeFile } from 'node:fs/promises';
import { parse as parseScss } from 'postcss-scss';
import parseSelector from 'postcss-selector-parser';

export const generateCssModuleType = async (scssFilePath: string) => {
  const classNames = getClassNames(await readFile(scssFilePath, 'utf-8'));
  const dest = `${scssFilePath}.d.ts`;
  await writeFile(dest, generateCode(classNames));
  return dest;
};

const getClassNames = (scssCode: string) => {
  const classNames = new Set<string>();
  parseScss(scssCode).walkRules((rule) => {
    parseSelector((selectors) => {
      selectors.walkClasses((selector) => {
        classNames.add(selector.value);
      });
    }).processSync(rule.selector);
  });
  return classNames;
};

const generateCode = (classNames: Set<string>) => {
  let code = '';
  for (const className of classNames) {
    code += `export declare const ${className}: string;\n`;
  }
  return code;
};
