import fs from 'fs';
import console from 'console';
import {getExtension} from './util/getExtension';
import {listFiles} from '../packages/node/listFiles';

const copyFiles = async () => {
    const projectRootUrl = new URL('..', `file://${__dirname}/`);
    const srcDirectoryUrl = new URL('src-tool/', projectRootUrl);
    const destDirectoryUrl = new URL('.tool/', projectRootUrl);
    for await (const fileUrl of listFiles(srcDirectoryUrl)) {
        if (isToBeCopied(fileUrl)) {
            const relativePath = fileUrl.pathname.slice(srcDirectoryUrl.pathname.length);
            const destUrl = new URL(relativePath, destDirectoryUrl);
            await fs.promises.copyFile(fileUrl, destUrl);
            console.info(`copied: ${destUrl.pathname}`);
        }
    }
};

const isToBeCopied = (
    fileUrl: URL,
): boolean => {
    switch (getExtension(fileUrl.pathname)) {
    case '.ts':
        return false;
    default:
        return true;
    }
};

if (require.main === module) {
    copyFiles().catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    });
}
