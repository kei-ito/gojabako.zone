import type {PageData} from '../util/getPageData';
import {getPages} from '../util/getPages';
import {loadPackageJson} from '../util/loadPackageJson';
import {toSafeString} from './StringToJsxSafeString';

export const serializeAtom = async function* () {
    yield '<?xml version="1.0" encoding="utf-8"?>';
    yield '<feed xmlns="http://www.w3.org/2005/Atom">';
    const {siteName, homepage} = await loadPackageJson();
    const pages = (await getPages()).sort(byLastCommitData);
    yield `  <title>${siteName}</title>`;
    yield `  <link href="${homepage}"/>`;
    const now = new Date();
    const updatedAt = pages[0].lastCommitAt || now;
    yield `  <updated>${updatedAt.toISOString()}</updated>`;
    yield `  <id>${homepage}</id>`;
    let index = 0;
    for await (const page of pages) {
        yield '  <entry>';
        yield `    <id>${page.url}</id>`;
        yield `    <title>${toSafeString(page.title)}</title>`;
        yield `    <link href="${page.url}"/>`;
        yield `    <updated>${(page.lastCommitAt || now).toISOString()}</updated>`;
        yield `    <published>${(page.firstCommitAt || now).toISOString()}</published>`;
        yield '  </entry>';
        if (20 < ++index) {
            break;
        }
    }
    yield '</feed>';
};

const byLastCommitData = (
    {lastCommitAt: date1}: PageData,
    {lastCommitAt: date2}: PageData,
) => {
    const now = Date.now();
    const t1 = date1 ? date1.getTime() : now;
    const t2 = date2 ? date2.getTime() : now;
    return t1 < t2 ? -1 : 1;
};
