import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {URL} from '../../packages/es/global';
import {toJsxSafeString} from '../../packages/es/toJsxSafeString';
import {siteName, siteDomain} from '../../packages/site/constants';
import {pageListByPublishedAt, pageListByUpdatedAt} from '../pageList';

const homepage = `https://${siteDomain}`;

export const middleware = (req: NextRequest) => {
    const {pathname} = req.nextUrl;
    switch (pathname) {
    case '/sitemap.xml':
        return respondSitemap();
    case '/feed.atom':
        return respondFeed();
    default:
        return undefined;
    }
};

const respondSitemap = () => new NextResponse(
    [...serializeSitemap()].join('\n'),
    {
        headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=3600',
        },
    },
);

const serializeSitemap = function* () {
    yield '<?xml version="1.0" encoding="UTF-8"?>';
    yield '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    for (const page of pageListByPublishedAt) {
        const url = new URL(page.pathname, homepage).href.replace(/\/$/, '');
        yield '  <url>';
        yield `    <loc>${url}</loc>`;
        yield `    <lastmod>${page.updatedAt}</lastmod>`;
        yield '  </url>';
    }
    yield '</urlset>';
};

const respondFeed = () => new NextResponse(
    [...serializeFeed()].join('\n'),
    {
        headers: {
            'content-type': 'application/atom+xml; charset=utf-8',
            'cache-control': 'public, max-age=3600',
        },
    },
);

const serializeFeed = function* () {
    yield '<?xml version="1.0" encoding="utf-8"?>';
    yield '<feed xmlns="http://www.w3.org/2005/Atom">';
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
