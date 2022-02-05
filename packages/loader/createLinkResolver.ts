import * as path from 'path';
import {getPagePathName} from '../page/getPagePathName';

export const createLinkResolver = (absoluteSourceFilePath: string) => (href: string) => {
    const absoluteFilePath = path.resolve(path.dirname(absoluteSourceFilePath), href);
    return getPagePathName(absoluteFilePath);
};
