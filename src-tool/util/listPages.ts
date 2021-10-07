import {findPageData} from './getPageData';
import {listFiles} from './listFiles';

export const listPages = async function* () {
    const pagesDirectoryUrl = new URL('../../src/pages', import.meta.url);
    for await (const fileUrl of listFiles(pagesDirectoryUrl)) {
        const pageData = await findPageData(fileUrl);
        if (pageData) {
            yield pageData;
        }
    }
};
