import type {NextMiddleware} from 'next/server';
import {NextResponse} from 'next/server';

export const middleware: NextMiddleware = (req) => {
    const {pathname} = req.nextUrl;
    switch (pathname) {
    case '/sitemap.xml':
        return NextResponse.rewrite('/api/sitemap');
    case '/feed.atom':
        return NextResponse.rewrite('/api/feed');
    default:
        return NextResponse.next();
    }
};
