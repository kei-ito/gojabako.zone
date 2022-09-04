// @ts-check
import * as path from 'path';
import * as fs from 'fs';
import {toJsxSafeString} from '@gjbkz/gojabako.zone-markdown-parser';
import {getPageList, pageListToJsModule} from '@gjbkz/gojabako.zone-build-pagelist';
import {siteDomain, siteName} from '../site.mjs';
import {rootDirectory, pagesDirectory, publicDirectory} from '../paths.mjs';

/**
 * @param {URL | string} dest
 * @param {() => AsyncIterable<string> | Iterable<string>} serializer
 */
const writeToFile = async (dest, serializer) => {
    const writer = fs.createWriteStream(dest);
    for await (const line of serializer()) {
        writer.write(`${line}\n`);
    }
    writer.end();
};

if (!process.env.CI) {
    const list = await getPageList({rootDirectory, pagesDirectory});
    const {pageListByPublishedAt} = list;
    const pageListByUpdatedAt = list.toListByUpdatedAt.map((i) => pageListByPublishedAt[i]);
    await Promise.all([
        fs.promises.writeFile(
            path.join(rootDirectory, 'generated.pageList.mjs'),
            pageListToJsModule(list),
        ),
        writeToFile(path.join(publicDirectory, 'feed.atom'), function* () {
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
        }),
        writeToFile(path.join(publicDirectory, 'sitemap.xml'), function* () {
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
        }),
    ]);
}
