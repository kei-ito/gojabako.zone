import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import sharp from 'sharp';
import {console, Error} from '../es/global';
import {rootDirectoryPath} from '../fs/constants';
import {runScript} from '../node/runScript';

const widthList = [200, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 2000];

runScript(async () => {
    if (process.argv.length !== 4) {
        throw new Error(`InvalidArgs: ${process.argv.slice(2).join(' ')}`);
    }
    const [,, sourceFileAbsolutePath, outputDirectoryAbsolutePath] = process.argv;
    const relativePath = path.relative(rootDirectoryPath, sourceFileAbsolutePath);
    const input = sharp(await fs.promises.readFile(sourceFileAbsolutePath));
    const metadata = await input.metadata();
    const {width: originalWidth, height: originalHeight} = metadata;
    if (!originalWidth || !originalHeight) {
        throw new Error(`UnknownSize: ${originalWidth}x${originalHeight}`);
    }
    console.info(relativePath, metadata.format, `${metadata.width}x${metadata.height}`);
    for (const width of widthList) {
        if (width <= originalWidth) {
            console.info(relativePath, metadata.format, width);
        }
    }
    outputDirectoryAbsolutePath.slice();
});
