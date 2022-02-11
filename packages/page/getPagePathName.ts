import * as path from 'path';
import {rootDirectoryPath} from '../fs/constants';
import {Error, console} from '../es/global';

const pagesDirectoryPath = path.join(rootDirectoryPath, 'src/pages');

export const getPagePathName = (fileAbsolutePath: string): string => {
    if (!fileAbsolutePath.startsWith(pagesDirectoryPath)) {
        throw new Error(`The page file isn't in the pages directory: ${fileAbsolutePath}`);
    }
    const fragments = fileAbsolutePath.slice(pagesDirectoryPath.length).split(path.sep);
    if (fragments[fragments.length - 1].startsWith('_')) {
        throw new Error(`The page file starts with "_": ${fileAbsolutePath}`);
    }
    let result = fragments.join('/').replace(/\.\w+$/, '');
    if (result.endsWith('.page')) {
        result = result.slice(0, -5);
    }
    if (result.endsWith('/index')) {
        result = result.slice(0, -6);
    }
    if (!result) {
        result = '/';
    }
    console.info(`getPagePathName: ${result}`);
    return result;
};
