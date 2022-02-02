import * as path from 'path';
import {console, Promise} from '../es/global';
import {rootDirectoryPath} from '../fs/constants';
import {listFiles} from '../node/listFiles';
import {runScript} from '../node/runScript';
import type {SpawnResult} from '../node/spawn';
import {spawn} from '../node/spawn';

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
    const publicImageDirectoryPath = path.join(rootDirectoryPath, 'public', 'images');
    const workerScriptPath = path.join(rootDirectoryPath, '.output', 'build', 'image.mjs');
    const workers: Array<Promise<SpawnResult>> = [];
    for await (const sourceFileAbsolutePath of listFiles(srcDirectoryPath, isImageFile)) {
        const relativePath = path.relative(srcDirectoryPath, sourceFileAbsolutePath);
        const outputDirectoryAbsolutePath = path.join(publicImageDirectoryPath, relativePath);
        const command = ['node', workerScriptPath, sourceFileAbsolutePath, outputDirectoryAbsolutePath].join(' ');
        workers.push(spawn(command));
    }
    await Promise.all(workers);
    console.info(`${workers.length} images are ready`);
});
