import * as fs from 'fs';
import * as path from 'path';
import * as postcss from 'postcss';
import sass from 'sass';
import {nullaryCache} from '../es/cache';
import {Error, Map} from '../es/global';
import type {Resolved} from '../es/type';
import {rootDirectoryPath} from '../fs/constants';

export const getSiteCSS = nullaryCache(async () => {
    const cssFilePath = path.join(rootDirectoryPath, 'pages/globals.scss');
    const css = await fs.promises.readFile(cssFilePath, 'utf8');
    const compiled = await sass.compileStringAsync(css);
    return postcss.parse(compiled.css);
});

export const getSiteCSSVariables = nullaryCache(async () => {
    const root = await getSiteCSS();
    const variables = new Map<string, string>();
    root.walkRules((rule) => {
        if (rule.selectors.includes(':root')) {
            rule.walkDecls((decl) => {
                if (decl.variable && decl.prop.startsWith('--')) {
                    variables.set(decl.prop.slice(2), decl.value);
                }
            });
        }
    });
    return variables;
});

export const getSiteColors = nullaryCache(async () => {
    const variables = await getSiteCSSVariables();
    const getVariable = (key: string) => {
        const value = variables.get(key);
        if (!value) {
            throw new Error(`NoValue: --${key} is not defined.`);
        }
        return value;
    };
    return {
        gray0: getVariable('gray0'),
        gray1: getVariable('gray1'),
        gray2: getVariable('gray2'),
        gray3: getVariable('gray3'),
        gray4: getVariable('gray4'),
        gray5: getVariable('gray5'),
        gray6: getVariable('gray6'),
        gray7: getVariable('gray7'),
        gray8: getVariable('gray8'),
        gray9: getVariable('gray9'),
    };
});

export type SiteColors = Resolved<ReturnType<typeof getSiteColors>>;
