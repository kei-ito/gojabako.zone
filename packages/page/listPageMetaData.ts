import * as path from 'path';
import {rootDirectoryPath} from '../fs/constants';
import {listFiles} from '../node/listFiles';
import {findPageMetaData} from './findPageMetaData';

const isPageFile = (filePath: string) => !filePath.endsWith('.component.tsx')
&& !filePath.endsWith('.css.ts')
&& !path.basename(filePath).startsWith('_')
&& (
    (/\.tsx?$/).test(filePath)
    || filePath.endsWith('.page.md')
);

export const listPageMetaData = async function* () {
    for await (const fileUrl of listFiles(path.join(rootDirectoryPath, 'pages'))) {
        if (isPageFile(fileUrl)) {
            const pageMetaData = await findPageMetaData(fileUrl);
            if (pageMetaData) {
                yield pageMetaData;
            }
        }
    }
};
