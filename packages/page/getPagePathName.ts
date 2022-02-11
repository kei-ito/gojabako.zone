import * as path from 'path';
import {rootDirectoryPath} from '../fs/constants';
import {Error} from '../es/global';

const pagesDirectoryPath = path.join(rootDirectoryPath, 'src/pages');

export const getPagePathName = (fileAbsolutePath: string): string => {
    if (!fileAbsolutePath.startsWith(pagesDirectoryPath)) {
        throw new Error(`The page file isn't in the pages directory: ${fileAbsolutePath}`);
    }
    if (path.basename(fileAbsolutePath).startsWith('_')) {
        throw new Error(`The page file starts with "_": ${fileAbsolutePath}`);
    }
    let result = path.relative(pagesDirectoryPath, fileAbsolutePath).split(path.sep).join('/').replace(/\.\w+$/, '');
    result = `/${result}`;
    if (result.endsWith('.page')) {
        result = result.slice(0, -5);
    }
    if (result.endsWith('/index')) {
        result = result.slice(0, -6);
    }
    return result || '/';
};
