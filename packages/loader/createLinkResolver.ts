import {getPagePathName} from '../page/getPagePathName';

export const createLinkResolver = (absoluteSourceFilePath: string) => (href: string) => {
    if (href.startsWith('/')) {
        return getPagePathName(href);
    }
    return getPagePathName(`${absoluteSourceFilePath}/${href}`);
};
