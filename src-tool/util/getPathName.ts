import {getExtension} from './getExtension';
import {pagesUrl} from './url';

export const getPathName = (fileUrl: URL): string | null => {
    let pathname = `/${fileUrl.pathname.slice(pagesUrl.pathname.length)}`;
    if (pathname.endsWith('.page.md')) {
        pathname = pathname.slice(0, -8);
    } else {
        const basename = pathname.slice(pathname.lastIndexOf('/') + 1);
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
    return pathname.replace(/\/?(index)?$/, '');
};
