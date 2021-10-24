import * as fs from 'fs';
import {JSON, URL} from '../es/global';

// eslint-disable-next-line @nlib/no-globals
export const rootDirectoryUrl = new URL('../..', `file://${__dirname}/`);
export const srcDirectoryUrl = new URL('src/', rootDirectoryUrl);
export const componentsDirectoryUrl = new URL('src/components/', rootDirectoryUrl);
export const pagesDirectoryUrl = new URL('src/pages/', rootDirectoryUrl);

export const packageJson = JSON.parse(
    fs.readFileSync(new URL('package.json', rootDirectoryUrl), 'utf-8'),
) as {
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>,
};
