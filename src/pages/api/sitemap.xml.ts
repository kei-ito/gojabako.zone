import type {NextApiHandler} from 'next';
import {Date} from '../../global';
import {pageList} from '../../util/pageList.generated';

const handler: NextApiHandler = async (_req, res) => {
    res.writeHead(200, {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=3600',
    });
    for await (const line of serialize()) {
        res.write(`${line}\n`);
    }
    res.end();
};

const serialize = async function* () {
    yield '<?xml version="1.0" encoding="UTF-8"?>';
    yield '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const now = new Date().toISOString();
    for await (const page of pageList) {
        yield '  <url>';
        yield `    <loc>${page.url}</loc>`;
        yield `    <lastmod>${page.lastCommitAt || now}</lastmod>`;
        yield '  </url>';
    }
    yield '</urlset>';
};

export default handler;
