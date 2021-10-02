import Head from 'next/head';
import type {PropsWithChildren} from 'react';

export interface PageProps {
    title: string,
    description: string,
    url: string,
}

export const Page = ({title, description, url, children}: PropsWithChildren<PageProps>) => <>
    <Head>
        <title>{title}</title>
        <meta name="description" content={description}/>
        <meta name="og:url" content={url}/>
    </Head>
    <main>
        <section>
            {children}
        </section>
    </main>
</>;
