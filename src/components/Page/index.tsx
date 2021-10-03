import Head from 'next/head';
import type {PropsWithChildren} from 'react';

export interface PageProps {
    title: string,
    description: string,
    url: string,
    author?: string,
}

export const Page = ({title, description, url, author, children}: PropsWithChildren<PageProps>) => <>
    <Head>
        <title>{title}</title>
        <link rel="canonical" href={url}/>
        <meta name="description" content={description}/>
        {author && <meta name="author" content={author}/>}
        <meta name="og:url" content={url}/>
    </Head>
    <main>
        <article>
            <section>
                {children}
            </section>
        </article>
    </main>
</>;
