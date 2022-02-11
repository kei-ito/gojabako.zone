import * as path from 'path';
import * as console from 'console';
import {getPagePathName} from '../page/getPagePathName';

export const createLinkResolver = (absoluteSourceFilePath: string) => {
    const baseDirectoryPath = path.dirname(absoluteSourceFilePath);
    return (href: string) => {
        if (href.startsWith('/')) {
            return getPagePathName(href);
        }
        const joined = path.join(baseDirectoryPath, ...href.split('/'));
        console.info(`LinkResolver: ${baseDirectoryPath} ${href}`);
        console.info(`LinkResolver: → ${joined}`);
        return getPagePathName(joined);
    };
};
