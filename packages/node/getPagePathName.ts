import * as path from 'path';
import {getBaseName} from '../es/getBaseName';
import {rootDirectoryPath} from '../fs/constants';
import {Error} from '../es/global';

const pagesDirectoryPath = path.join(rootDirectoryPath, 'src/pages');

export const getPagePathName = (fileAbsolutePath: string): string | null => {
    const basename = getBaseName(fileAbsolutePath);
    if (basename.startsWith('_')) {
        return null;
    }
    const normalizedFileAbsolutePath = path.normalize(fileAbsolutePath);
    if (!normalizedFileAbsolutePath.startsWith(pagesDirectoryPath)) {
        throw new Error(`The page file isn't in the pages directory: ${normalizedFileAbsolutePath}`);
    }
    return ['', ...path.relative(pagesDirectoryPath, normalizedFileAbsolutePath).split(path.sep)].join('/')
    .replace(/\.\w+$/, '')
    .replace(/\.page$/, '')
    .replace(/(\/?)index$/, '/');
};
