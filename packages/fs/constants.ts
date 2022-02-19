import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import {JSON} from '../es/global';

export const rootDirectoryPath = process.cwd();
export const publicDirectory = path.join(rootDirectoryPath, 'public');
export const processedImagesDirectory = path.join(publicDirectory, 'images');
export const coverImagesDirectory = path.join(publicDirectory, 'covers');
export const packageJson = JSON.parse(
    fs.readFileSync(path.join(rootDirectoryPath, 'package.json'), 'utf-8'),
) as {
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>,
};
