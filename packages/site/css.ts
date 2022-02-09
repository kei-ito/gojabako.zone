import * as fs from 'fs';
import * as path from 'path';
import * as postcss from 'postcss';
import {nullaryCache} from '../es/cache';
import {Error, Map} from '../es/global';
import type {Resolved} from '../es/type';
import {rootDirectoryPath} from '../fs/constants';

export const getSiteCSS = nullaryCache(async () => {
    const cssFilePath = path.join(rootDirectoryPath, 'src', 'globals.css');
    const css = await fs.promises.readFile(cssFilePath, 'utf8');
    return postcss.parse(css);
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
        main: getVariable('mainColor'),
        text: getVariable('textColor'),
        accent: getVariable('accentColor'),
        background: getVariable('backgroundColor'),
        white: getVariable('white'),
    };
});

export type SiteColors = Resolved<ReturnType<typeof getSiteColors>>;
