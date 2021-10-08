import {listPages} from '../util/listPages';

export const serializeSitemap = async function* () {
    yield '<?xml version="1.0" encoding="UTF-8"?>';
    yield '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    for await (const page of listPages()) {
        yield '  <url>';
        yield `    <loc>${page.url}</loc>`;
        yield `    <lastmod>${(page.lastCommitAt || new Date()).toISOString()}</lastmod>`;
        yield '  </url>';
    }
    yield '</urlset>';
};
