import * as path from 'path';
import {URL, fileURLToPath} from 'url';
import {buildImages} from '@gjbkz/gojabako.zone-build-images';
import {listFiles} from '@gjbkz/gojabako.zone-node-util';

// eslint-disable-next-line @nlib/no-globals
const rootDirectory = fileURLToPath(new URL('..', import.meta.url));
const publicDirectory = path.join(rootDirectory, 'public');
const pagesDirectory = path.join(rootDirectory, 'pages');
const processedImageDirectory = path.join(publicDirectory, 'images');
const coverImagesDirectory = path.join(publicDirectory, 'covers');
const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.heic'];
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
    publicDirectory,
    processedImageDirectory,
});
