import * as path from 'path';
import {getExtension} from '../es/getExtension';
import {getBaseName} from '../es/getBaseName';
import {rootDirectoryPath} from '../fs/constants';
import {Error} from '../es/global';

const pagesDirectoryPath = path.join(rootDirectoryPath, 'src/pages');

export const getPagePathName = (fileAbsolutePath: string): string | null => {
    const normalizedFileAbsolutePath = path.normalize(fileAbsolutePath);
    if (!normalizedFileAbsolutePath.startsWith(pagesDirectoryPath)) {
        throw new Error(`The page file isn't in the pages directory: ${normalizedFileAbsolutePath}`);
    }
    let pathname = path.relative(pagesDirectoryPath, normalizedFileAbsolutePath);
    if (pathname.endsWith('.page.md')) {
        pathname = pathname.slice(0, -8);
    } else {
        const basename = getBaseName(pathname);
        if (basename.startsWith('_')) {
            return null;
        }
        const extname = getExtension(pathname);
        switch (extname) {
        case '.tsx':
        case '.jsx':
            pathname = pathname.slice(0, -extname.length);
            break;
        default:
            return null;
        }
    }
    return pathname.replace(/(\/?)index$/, '/');
};
