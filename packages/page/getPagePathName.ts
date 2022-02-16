import * as path from 'path';
import {rootDirectoryPath} from '../fs/constants';
import {Error} from '../es/global';

const pagesDirectoryPath = path.join(rootDirectoryPath, 'src/pages');

export const getPagePathName = (fileAbsolutePath: string): string => {
    const normalizedFileAbsolutePath = path.normalize(fileAbsolutePath.split('/').join(path.sep));
    if (!normalizedFileAbsolutePath.startsWith(pagesDirectoryPath)) {
        throw new Error(`The page file isn't in the pages directory: ${normalizedFileAbsolutePath}`);
    }
    if (path.basename(normalizedFileAbsolutePath).startsWith('_')) {
        throw new Error(`The page file starts with "_": ${normalizedFileAbsolutePath}`);
    }
    let result = path.relative(pagesDirectoryPath, normalizedFileAbsolutePath);
    result = `/${result.split(path.sep).join('/')}`;
    result = result.replace(/\.\w+$/, '');
    if (result.endsWith('.page')) {
        result = result.slice(0, -5);
    }
    if (result.endsWith('/index')) {
        result = result.slice(0, -6);
    }
    return result;
};
