import {findPageData} from './getPageData';
import {listFiles} from '../../packages/node/listFiles';
import {pagesUrl} from './url';

export const listPages = async function* () {
    for await (const fileUrl of listFiles(pagesUrl)) {
        const pageData = await findPageData(fileUrl);
        if (pageData) {
            yield pageData;
        }
    }
};
