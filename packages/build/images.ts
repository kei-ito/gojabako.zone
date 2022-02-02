import * as path from 'path';
import {console} from '../es/global';
import {rootDirectoryPath} from '../fs/constants';
import {listFiles} from '../node/listFiles';
import {runScript} from '../node/runScript';
import {spawn} from '../node/spawn';

const isImageFile = (filePath: string) => {
    switch (path.extname(filePath).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
    case '.svg':
    case '.heic':
        return true;
    default:
        return false;
    }
};

runScript(async () => {
    const srcDirectoryPath = path.join(rootDirectoryPath, 'src');
    const publicImageDirectoryPath = path.join(rootDirectoryPath, 'public', 'images');
    const workerScriptPath = path.join(rootDirectoryPath, '.output', 'build', 'image.mjs');
    const processedImages: Array<string> = [];
    for await (const sourceFileAbsolutePath of listFiles(srcDirectoryPath, isImageFile)) {
        const relativePath = path.relative(srcDirectoryPath, sourceFileAbsolutePath);
        const outputDirectoryAbsolutePath = path.join(publicImageDirectoryPath, relativePath);
        const command = ['node', workerScriptPath, sourceFileAbsolutePath, outputDirectoryAbsolutePath].join(' ');
        await spawn(command);
        processedImages.push(sourceFileAbsolutePath);
    }
    console.info(`${processedImages.length} images are ready`);
});
