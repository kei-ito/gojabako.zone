import * as path from 'path';
import {getSiteData} from './getSiteData';
export interface LoaderThis {
    context: string,
    resourcePath: string,
}

const projectRoot = new URL('../..', import.meta.url).pathname;
const contextRoot = path.join(projectRoot, 'src/pages');

export class LoaderContext {

    protected readonly loaderThis: LoaderThis;

    protected readonly ext: string;

    public constructor(
        loaderThis: LoaderThis,
        ext: string,
    ) {
        this.loaderThis = loaderThis;
        this.ext = ext;
    }

    public get pathname() {
        let pathname = path.relative(contextRoot, this.loaderThis.resourcePath);
        if (pathname.endsWith(this.ext)) {
            pathname = pathname.slice(0, -this.ext.length);
        }
        return pathname;
    }

    public get url() {
        return new URL(this.pathname, getSiteData().baseUrl);
    }

    public getRelativePath(
        pathFromProjectRoot: string,
    ): string {
        const absolutePath = path.join(projectRoot, pathFromProjectRoot);
        let relativePath = path.relative(this.loaderThis.context, absolutePath);
        if (!relativePath.startsWith('.')) {
            relativePath = `./${relativePath}`;
        }
        return relativePath;
    }

}
