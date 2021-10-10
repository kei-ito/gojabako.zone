import {getRelativePath} from './getRelativePath';
import {componentsUrl} from './url';

export const getCompoentPath = (pageUrl: URL, componentName: string) => {
    const componentUrl = new URL(`${componentName}/index.tsx`, componentsUrl);
    let pageDir = pageUrl.pathname;
    pageDir = pageDir.slice(0, Math.max(0, pageDir.lastIndexOf('/')));
    return getRelativePath(pageDir, componentUrl.pathname);
};
