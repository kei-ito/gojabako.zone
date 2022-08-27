import * as path from 'path';
import {getRelativePath} from '../es/getRelativePath';
import {rootDirectoryPath} from './constants';

export const getComponentPath = (pagePath: string, componentName: string) => {
    const componentPath = path.join(rootDirectoryPath, `packages/components/${componentName}`);
    const pageDir = path.dirname(pagePath);
    return getRelativePath(pageDir, componentPath);
};
