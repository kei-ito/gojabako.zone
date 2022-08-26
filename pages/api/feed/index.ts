import {HttpStatusCode} from '@nlib/typing';
import type {NextApiHandler} from 'next';
import {URL} from '../../../packages/es/global';
import {toJsxSafeString} from '../../../packages/es/toJsxSafeString';
import {siteDomain, siteName} from '../../../packages/site/constants';
import {pageListByUpdatedAt} from '../../../packages/site/pageList';

export const handler: NextApiHandler = (_req, res) => {
    res.writeHead(HttpStatusCode.OK, {
        'content-type': 'application/atom+xml; charset=utf-8',
        'cache-control': 'public, max-age=3600',
    });
    for (const line of serializeFeed()) {
        res.write(`${line}\n`);
    }
    res.end();
};

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
        yield `    <title>${toJsxSafeString(page.title)}</title>`;
        yield `    <link href="${url}"/>`;
        yield `    <updated>${page.updatedAt}</updated>`;
        yield `    <published>${page.publishedAt}</published>`;
        yield '  </entry>';
    }
    yield '</feed>';
};
