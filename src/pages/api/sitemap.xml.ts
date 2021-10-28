import type {NextApiHandler} from 'next';
import packgeJson from '../../../package.json';
import {URL} from '../../../packages/es/global';
import {pageListByPublishedAt} from '../../pageList';

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
    for await (const page of pageListByPublishedAt) {
        const url = new URL(page.pathname, packgeJson.homepage);
        yield '  <url>';
        yield `    <loc>${url}</loc>`;
        yield `    <lastmod>${page.updatedAt}</lastmod>`;
        yield '  </url>';
    }
    yield '</urlset>';
};

export default handler;
