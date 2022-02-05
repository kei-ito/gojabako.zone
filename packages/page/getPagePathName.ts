import * as path from 'path';
import {getBaseName} from '../es/getBaseName';
import {rootDirectoryPath} from '../fs/constants';
import {Error} from '../es/global';

const pagesDirectoryPath = path.join(rootDirectoryPath, 'src/pages');

export const getPagePathName = (fileAbsolutePath: string): string => {
    const basename = getBaseName(fileAbsolutePath);
    if (basename.startsWith('_')) {
        throw new Error(`The page file starts with "_": ${basename}`);
    }
    const normalizedFileAbsolutePath = path.normalize(fileAbsolutePath);
    if (!normalizedFileAbsolutePath.startsWith(pagesDirectoryPath)) {
        throw new Error(`The page file isn't in the pages directory: ${normalizedFileAbsolutePath}`);
    }
    let result = ['', ...path.relative(pagesDirectoryPath, normalizedFileAbsolutePath).split(path.sep)].join('/').replace(/\.\w+$/, '');
    if (result.endsWith('.page')) {
        result = result.slice(0, -5);
    }
    if (result.endsWith('/index')) {
        result = result.slice(0, -6);
    }
    if (!result) {
        result = '/';
    }
    return result;
};
