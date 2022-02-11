import * as console from 'console';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import {pageListByPublishedAt} from '../../src/pageList';
import {JSON} from '../es/global';
import {rootDirectoryPath} from '../fs/constants';
import {runScript} from '../node/runScript';
import type {PageImageData} from '../page/generatePageImage';
import {generatePageImage} from '../page/generatePageImage';

runScript(async () => {
    if (process.env.CI) {
        console.info('BuildPageImages: skipped');
        return;
    }
    const pageImages: Record<string, PageImageData> = {};
    for (const page of pageListByPublishedAt) {
        const result = await generatePageImage(page);
        pageImages[page.pathname] = result;
        console.info(`pageImage: ${page.pathname} → ${result.path}`);
    }
    const code = `
// This file was generated by \`npm run build:pageImages\`
/* eslint-disable */
export interface PageImageData {
    path: string,
    width: number,
    height: number,
}
export const pageImages: Record<string, PageImageData | undefined> = ${JSON.stringify(pageImages, null, 4)};
`.trimStart();
    const dest = path.join(rootDirectoryPath, 'src/pageImageList.ts');
    await fs.promises.writeFile(dest, code);
    console.info(`BuildPageImages: ${dest}`);
});
