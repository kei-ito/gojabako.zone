import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import {rootDirectory} from '../../paths.mjs';
import {JSON} from '../es/global';
import type {PageImageData} from '../page/generatePageImage';
import {generatePageImage} from '../page/generatePageImage';
import {pageListByPublishedAt} from '../site/pageList';

if (!process.env.CI) {
    const pageImages: Record<string, PageImageData> = {};
    for await (const page of pageListByPublishedAt) {
        const result = await generatePageImage(page);
        pageImages[page.pathname] = result;
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
    const dest = path.join(rootDirectory, 'packages/site/pageImageList.ts');
    await fs.promises.writeFile(dest, code);
}
