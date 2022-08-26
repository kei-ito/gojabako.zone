import {HttpStatusCode} from '@nlib/typing';
import type {NextApiHandler} from 'next';
import {URL} from '../../../packages/es/global';
import {siteDomain} from '../../../packages/site/constants';
import {pageListByPublishedAt} from '../../../packages/site/pageList';

export const handler: NextApiHandler = (_req, res) => {
    res.writeHead(HttpStatusCode.OK, {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=3600',
    });
    for (const line of serializeSitemap()) {
        res.write(`${line}\n`);
    }
    res.end();
};

const serializeSitemap = function* () {
    yield '<?xml version="1.0" encoding="UTF-8"?>';
    yield '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const homepage = `https://${siteDomain}`;
    for (const page of pageListByPublishedAt) {
        const url = new URL(page.pathname, homepage).href.replace(/\/$/, '');
        yield '  <url>';
        yield `    <loc>${url}</loc>`;
        yield `    <lastmod>${page.updatedAt}</lastmod>`;
        yield '  </url>';
    }
    yield '</urlset>';
};
