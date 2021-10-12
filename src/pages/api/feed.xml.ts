import type {NextApiHandler} from 'next';
import packgeJson from '../../../package.json';
import {URL} from '../../global';
import {pageListByUpdatedAt} from '../../util/pageList';
import {sanitize} from '../../util/sanitize';

const handler: NextApiHandler = async (_req, res) => {
    res.writeHead(200, {
        'content-type': 'application/atom+xml; charset=utf-8',
        'cache-control': 'public, max-age=3600',
    });
    for await (const line of serialize()) {
        res.write(`${line}\n`);
    }
    res.end();
};

const serialize = async function* () {
    yield '<?xml version="1.0" encoding="utf-8"?>';
    yield '<feed xmlns="http://www.w3.org/2005/Atom">';
    yield `  <title>${packgeJson.siteName}</title>`;
    yield `  <link href="${packgeJson.homepage}"/>`;
    yield `  <updated>${pageListByUpdatedAt[0].updatedAt}</updated>`;
    yield `  <id>${packgeJson.homepage}</id>`;
    for await (const page of pageListByUpdatedAt.slice(0, 20)) {
        const url = new URL(page.pathname, packgeJson.homepage);
        yield '  <entry>';
        yield `    <id>${page.pathname}</id>`;
        yield `    <title>${sanitize(page.title)}</title>`;
        yield `    <link href="${url}"/>`;
        yield `    <updated>${page.updatedAt}</updated>`;
        yield `    <published>${page.publishedAt}</published>`;
        yield '  </entry>';
    }
    yield '</feed>';
};

export default handler;
