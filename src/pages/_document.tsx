/* eslint-disable @next/next/no-page-custom-font */
import { Head, Html, Main, NextScript } from 'next/document';
import { meta } from '../components/meta';
import { authorName, authorTwitter, siteName } from '../../config.site.mjs';

const Document = () => (
  <Html lang="ja">
    <Head>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.13.18/dist/katex.min.css"
        integrity="sha384-zTROYFVGOfTw7JV7KUu8udsvW2fx4lWOsCEDqhBreBwlHI4ioVRtmIvEThzJHGET"
        crossOrigin="anonymous"
      />
      <link rel="alternate" type="application/atom+xml" href="/feed.xml" />
      <meta.OgSiteName content={siteName} />
      <meta.TwitterSite content={`@${authorTwitter}`} />
      <meta.Author content={authorName} />
      <meta.TwitterCreator content={`@${authorTwitter}`} />
    </Head>
    <Main />
    <NextScript />
  </Html>
);

export default Document;
