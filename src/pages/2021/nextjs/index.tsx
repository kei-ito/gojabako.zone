import Head from 'next/head';
import {Section} from '../../../components/Section';
import Post from './body.md';

const Page = () => <>
    <Head>
        <title>サイトをNext.js/Vercelにしました。</title>
        <meta name="description" content="サイトをNext.js/Vercelにしました。"/>
    </Head>
    <main>
        <Section><Post/></Section>
    </main>
</>;

export default Page;
