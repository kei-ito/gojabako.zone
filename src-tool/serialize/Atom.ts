import {getPageList} from '../util/getPageList';
import {loadPackageJson} from '../util/loadPackageJson';
import {toJsxSafeString} from './StringToJsxSafeString';

export const serializeAtom = async function* () {
    yield '<?xml version="1.0" encoding="utf-8"?>';
    yield '<feed xmlns="http://www.w3.org/2005/Atom">';
    const {siteName, homepage} = await loadPackageJson();
    const {pageListByPublishedAt} = await getPageList();
    yield `  <title>${siteName}</title>`;
    yield `  <link href="${homepage}"/>`;
    yield `  <updated>${pageListByPublishedAt[0].updatedAt}</updated>`;
    yield `  <id>${homepage}</id>`;
    let index = 0;
    for await (const page of pageListByPublishedAt) {
        yield '  <entry>';
        yield `    <id>${page.url}</id>`;
        yield `    <title>${toJsxSafeString(page.title)}</title>`;
        yield `    <link href="${page.url}"/>`;
        yield `    <updated>${page.updatedAt}</updated>`;
        yield `    <published>${page.publishedAt}</published>`;
        yield '  </entry>';
        if (20 < ++index) {
            break;
        }
    }
    yield '</feed>';
};
