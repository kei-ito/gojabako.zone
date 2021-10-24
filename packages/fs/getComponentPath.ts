import {getRelativePath} from '../es/getRelativePath';
import {Math, URL} from '../es/global';
import {componentsDirectoryUrl} from './constants';

export const getCompoentPath = (pageUrl: URL, componentName: string) => {
    const componentUrl = new URL(`${componentName}/index.tsx`, componentsDirectoryUrl);
    let pageDir = pageUrl.pathname;
    pageDir = pageDir.slice(0, Math.max(0, pageDir.lastIndexOf('/')));
    return getRelativePath(pageDir, componentUrl.pathname);
};
