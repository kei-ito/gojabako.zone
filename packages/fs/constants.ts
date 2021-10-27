import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import {JSON} from '../es/global';

export const rootDirectoryPath = process.cwd();
export const packageJson = JSON.parse(
    fs.readFileSync(path.join(rootDirectoryPath, 'package.json'), 'utf-8'),
) as {
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>,
};
