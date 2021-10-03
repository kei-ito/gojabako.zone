import * as path from 'path';
export interface LoaderThis {
    context: string,
    resourcePath: string,
}

const rootPath = new URL('../..', import.meta.url).pathname;

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

    public get filePath() {
        return path.relative(rootPath, this.loaderThis.resourcePath);
    }

    public get pathname() {
        const contextRoot = path.join(rootPath, 'src/pages');
        let pathname = path.relative(contextRoot, this.loaderThis.resourcePath);
        if (pathname.endsWith(this.ext)) {
            pathname = pathname.slice(0, -this.ext.length);
        }
        return pathname;
    }

    public getRelativePath(
        pathFromProjectRoot: string,
    ): string {
        const absolutePath = path.join(rootPath, pathFromProjectRoot);
        let relativePath = path.relative(this.loaderThis.context, absolutePath);
        if (!relativePath.startsWith('.')) {
            relativePath = `./${relativePath}`;
        }
        return relativePath;
    }

}
