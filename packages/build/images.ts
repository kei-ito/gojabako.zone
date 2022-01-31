import * as path from 'path';
import {console} from '../es/global';
import {rootDirectoryPath} from '../fs/constants';
import {listFiles} from '../node/listFiles';
import {runScript} from '../node/runScript';

const isImageFile = (filePath: string) => {
    switch (path.extname(filePath)) {
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
    case '.svg':
        return true;
    default:
        return false;
    }
};

runScript(async () => {
    const srcDirectoryPath = path.join(rootDirectoryPath, 'src');
    for await (const absolutePath of listFiles(srcDirectoryPath, isImageFile)) {
        const relativePath = path.relative(srcDirectoryPath, absolutePath);
        console.info(`Image: ${relativePath}`);
    }
});
