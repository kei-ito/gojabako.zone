// @ts-check
import * as path from 'path';
import {buildImages} from '@gjbkz/gojabako.zone-build-images';
import {listFiles} from '@gjbkz/gojabako.zone-node-util';
import {
    coverImagesDirectory,
    pagesDirectory,
    processedImageDirectory,
    publicDirectory,
    rootDirectory,
} from '../config.paths.mjs';

const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.heic'];
/** @param {string} file */
const isImageFileToBeProcessed = (file) => {
    if (!extensions.includes(path.extname(file))) {
        return false;
    }
    for (const dir of [coverImagesDirectory, processedImageDirectory]) {
        if (file.startsWith(dir)) {
            return false;
        }
    }
    return true;
};
const listImageFiles = async function* () {
    for await (const file of listFiles(pagesDirectory, publicDirectory)) {
        if (isImageFileToBeProcessed(file)) {
            yield file;
        }
    }
};
await buildImages({
    imageFiles: listImageFiles(),
    rootDirectory,
    pagesDirectory,
    publicDirectory,
    processedImageDirectory,
});
