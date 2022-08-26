import * as fs from 'fs';
import * as path from 'path';
import {URL} from '../es/global';
import {publicDirectory} from '../fs/constants';
import {runScript} from '../node/runScript';
import {siteDomain} from '../site/constants';
import {pageListByPublishedAt} from '../site/pageList';

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

runScript(() => {
    const dest = path.join(publicDirectory, 'sitemap.xml');
    const writer = fs.createWriteStream(dest);
    for (const line of serializeSitemap()) {
        writer.write(`${line}\n`);
    }
    writer.end();
});
