import * as path from 'path';
import {rootDirectoryPath} from '../fs/constants';
import {listFiles} from '../node/listFiles';
import {findPageData} from './findPageData';

const isPageFile = (filePath: string) => !filePath.endsWith('.component.tsx')
&& !path.basename(filePath).startsWith('_')
&& (
    (/\.tsx?$/).test(filePath)
    || filePath.endsWith('.page.md')
);

export const listPageData = async function* () {
    for await (const fileUrl of listFiles(path.join(rootDirectoryPath, 'src/pages'))) {
        if (isPageFile(fileUrl)) {
            const pageData = await findPageData(fileUrl);
            if (pageData) {
                yield pageData;
            }
        }
    }
};
