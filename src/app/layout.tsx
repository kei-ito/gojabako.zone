/* eslint-disable @next/next/google-font-display, @next/next/no-page-custom-font */
// eslint-disable-next-line import/no-unassigned-import
import './globals.scss';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { baseUrl, siteName } from '../util/site.mts';

export const metadata: Metadata = {
  title: { template: `%s ・ ${siteName}`, default: siteName },
  metadataBase: baseUrl,
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
        <meta name="theme-color" content="hsla(0,0%,100%,0.8)" />
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
