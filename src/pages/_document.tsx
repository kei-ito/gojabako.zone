/* eslint-disable @next/next/no-page-custom-font */
import {Html, Head, Main, NextScript} from 'next/document';
import packageJson from '../../package.json';

const {siteName} = packageJson;

const Document = () => <Html lang="ja">
    <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap"/>
        <link rel="alternate" type="application/atom+xml" href="/api/feed.xml"/>
        <meta name="og:site_name" content={siteName}/>
    </Head>
    <Main/>
    <NextScript/>
</Html>;

export default Document;
