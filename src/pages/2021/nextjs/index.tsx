import Head from 'next/head';
import {Main} from '../../../components/Main';
import {Section} from '../../../components/Section';
import Post from './post.md';

const Page = () => <>
    <Head>
        <title>伊藤 慶 - Kei Ito</title>
        <meta name="description" content="伊藤 慶 (Kei Ito) の自己紹介"/>
        <meta property="og:type" content="website"/>
        <meta property="og:image" content="/logo.png"/>
        <meta property="og:image:type" content="image/png"/>
        <meta property="og:image:width" content="1080"/>
        <meta property="og:image:height" content="1080"/>
        <meta property="og:url" content="https://wemo.me/"/>
        <meta property="og:locale" content="ja_JP"/>
        <meta property="og:site_name" content="Kei Ito"/>
    </Head>
    <Main>
        <Section><Post/></Section>
    </Main>
</>;

export default Page;
