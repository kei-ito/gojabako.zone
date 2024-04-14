/* eslint-disable import/no-unassigned-import, @next/next/google-font-display, @next/next/no-page-custom-font */
import type { Metadata, Viewport } from 'next';
import type { PropsWithChildren } from 'react';
import { site } from '../util/site.mts';
import './globals.scss';
import './hljs.scss';

export const metadata: Metadata = {
  metadataBase: site.baseUrl,
  title: { template: `%s | ${site.name}`, default: site.name },
  applicationName: site.name,
  authors: [site.author],
};

export const viewport: Viewport = {
  themeColor: 'hsla(0,0%,100%,0.8)',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin={''}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <style>{'.material-symbols-rounded{font-size: inherit}'}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
