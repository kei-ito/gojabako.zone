import * as path from 'path';
import {getPagePathName} from '../page/getPagePathName';

export const createLinkResolver = (absoluteSourceFilePath: string) => {
    const baseDirectoryPath = path.dirname(absoluteSourceFilePath);
    return (href: string) => {
        if (href.startsWith('/')) {
            return getPagePathName(href);
        }
        return getPagePathName(path.join(baseDirectoryPath, ...href.split('/')));
    };
};
