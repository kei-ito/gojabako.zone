import * as path from 'path';
import {console, Promise} from '../es/global';
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

const listImageFiles = async function* () {
    for await (const sourceFileAbsolutePath of listFiles(path.join(rootDirectoryPath, 'src'))) {
        if (isImageFile(sourceFileAbsolutePath)) {
            yield sourceFileAbsolutePath;
        }
    }
    const outputImageDirectoryPath = path.join(rootDirectoryPath, 'public', 'images');
    for await (const sourceFileAbsolutePath of listFiles(path.join(rootDirectoryPath, 'public'))) {
        if (isImageFile(sourceFileAbsolutePath) && !sourceFileAbsolutePath.startsWith(outputImageDirectoryPath)) {
            yield sourceFileAbsolutePath;
        }
    }
};

runScript(async () => {
    const workerScriptPath = path.join(rootDirectoryPath, '.output', 'build', 'image.mjs');
    const processes: Array<Promise<unknown>> = [];
    for await (const sourceFileAbsolutePath of listImageFiles()) {
        const command = ['node', workerScriptPath, sourceFileAbsolutePath].join(' ');
        processes.push(spawn(command));
    }
    await Promise.all(processes);
    console.info(`${processes.length} images are ready`);
});
