/* eslint-disable import/no-unassigned-import, @next/next/google-font-display, @next/next/no-page-custom-font */
import './globals.scss';
import './hljs.scss';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { site } from '../util/site.mts';

export const metadata: Metadata = {
  metadataBase: site.baseUrl,
  title: { template: `%s ・ ${site.name}`, default: site.name },
  applicationName: site.name,
  themeColor: 'hsla(0,0%,100%,0.8)',
  authors: [site.author],
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
