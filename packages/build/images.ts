import * as fs from 'fs';
import * as path from 'path';
import {console, Promise} from '../es/global';
import {rootDirectoryPath} from '../fs/constants';
import {rmrf} from '../fs/rmrf';
import {ImageProcessorHashEncoding, ImageProcessorResultFileName, ImageProcessorVersion} from '../image/constants';
import {isImageFileName} from '../image/isImageFileName';
import {loadImageProcessorResult} from '../image/loadImageProcessorResult';
import {getHash} from '../node/getHash';
import {listFiles} from '../node/listFiles';
import {runScript} from '../node/runScript';
import {spawn} from '../node/spawn';

runScript(async () => {
    const workerScriptPath = path.join(rootDirectoryPath, '.output', 'build', 'image.mjs');
    const processes: Array<Promise<unknown>> = [];
    for await (const sourceFileAbsolutePath of listImageFiles()) {
        const command = ['node', workerScriptPath, sourceFileAbsolutePath].join(' ');
        processes.push(spawn(command));
    }
    await Promise.all(processes);
    console.info(`${processes.length} images are ready`);
    const outputImageDirectoryPath = path.join(rootDirectoryPath, 'public', 'images', ImageProcessorVersion);
    const names = (await fs.promises.readdir(outputImageDirectoryPath)).filter((name) => !name.startsWith('.'));
    const diff = names.length - processes.length;
    if (diff === 0) {
        return;
    }
    console.info(`There might be ${diff} outdated image set${diff === 1 ? '' : 's'}`);
    for (const name of names) {
        const directoryPath = path.join(outputImageDirectoryPath, name);
        if (!(await isValidImageProcessorResult(directoryPath))) {
            console.info(`${name} is outdated.`);
            await rmrf(directoryPath);
        }
    }
});

const listImageFiles = async function* () {
    const ignoredDirectories = [
        path.join(rootDirectoryPath, 'public', 'images'),
    ];
    for await (const sourceFileAbsolutePath of listFiles(path.join(rootDirectoryPath, 'src'), path.join(rootDirectoryPath, 'public'))) {
        if (isImageFileName(sourceFileAbsolutePath, ignoredDirectories)) {
            yield sourceFileAbsolutePath;
        }
    }
};

const isValidImageProcessorResult = async (
    outputDirectoryAbsolutePath: string,
) => {
    const result = await loadImageProcessorResult(
        path.join(outputDirectoryAbsolutePath, ImageProcessorResultFileName),
    ).catch((error) => {
        console.error(error);
        return null;
    });
    if (!result) {
        return false;
    }
    const sourceFilePath = path.join(rootDirectoryPath, 'src', result.relativePath);
    const buffer = await fs.promises.readFile(sourceFilePath);
    return result.hash === getHash(buffer).toString(ImageProcessorHashEncoding);
};
