import type {LoaderThis} from './LoaderThis';
import {pagesUrl} from './url';

export const getPathName = (
    loaderThis: LoaderThis,
    ext: string,
): string => {
    const fileUrl = new URL(loaderThis.resourcePath);
    return fileUrl.href.slice(pagesUrl.href.length, -ext.length);
};
