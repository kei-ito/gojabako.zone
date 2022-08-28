import * as fs from 'fs';
import * as path from 'path';
import {URL} from '../es/global';
import {toXmlSafeString} from '../es/toXmlSafeString';
import {publicDirectory} from '../fs/constants';
import {runScript} from '../node/runScript';
import {siteDomain, siteName} from '../site/constants';
import {pageListByUpdatedAt} from '../site/pageList';

const serializeFeed = function* () {
    yield '<?xml version="1.0" encoding="utf-8"?>';
    yield '<feed xmlns="http://www.w3.org/2005/Atom">';
    const homepage = `https://${siteDomain}`;
    yield `  <title>${siteName}</title>`;
    yield `  <link href="${homepage}"/>`;
    yield `  <updated>${pageListByUpdatedAt[0].updatedAt}</updated>`;
    yield `  <id>${homepage}</id>`;
    for (const page of pageListByUpdatedAt.slice(0, 20)) {
        const url = new URL(page.pathname, homepage);
        yield '  <entry>';
        yield `    <id>${page.pathname}</id>`;
        yield `    <title>${toXmlSafeString(page.title)}</title>`;
        yield `    <link href="${url}"/>`;
        yield `    <updated>${page.updatedAt}</updated>`;
        yield `    <published>${page.publishedAt}</published>`;
        yield '  </entry>';
    }
    yield '</feed>';
};

runScript(() => {
    const dest = path.join(publicDirectory, 'feed.atom');
    const writer = fs.createWriteStream(dest);
    for (const line of serializeFeed()) {
        writer.write(`${line}\n`);
    }
    writer.end();
});
