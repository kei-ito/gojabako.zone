import {getExtension} from './getExtension';
import {getBaseName} from './getBaseName';
import {pagesDirectoryUrl} from '../fs/constants';

export const getPagePathName = (fileUrl: URL): string | null => {
    let pathname = `/${fileUrl.pathname.slice(pagesDirectoryUrl.pathname.length)}`;
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
