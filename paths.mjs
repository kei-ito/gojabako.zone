import {fileURLToPath} from 'url';
import * as path from 'path';

export const rootDirectory = fileURLToPath(new URL('.', import.meta.url));
export const publicDirectory = path.join(rootDirectory, 'public');
export const pagesDirectory = path.join(rootDirectory, 'pages');
export const processedImageDirectory = path.join(publicDirectory, 'images');
export const coverImagesDirectory = path.join(publicDirectory, 'covers');
