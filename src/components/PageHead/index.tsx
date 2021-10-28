import Head from 'next/head';
import type {PropsWithChildren} from 'react';
import packageJson from '../../../package.json';
import {URL} from '../../../packages/es/global';

const {homepage, siteName, authorName} = packageJson;

export interface PageHeadProps {
    title: string,
    description: string,
    pathname: string,
    author?: string,
}

export const PageHead = (
    {title, description, pathname, author, children}: PropsWithChildren<PageHeadProps>,
) => {
    const url = new URL(pathname, homepage).href;
    return <Head>
        <title>{title} ・ {siteName}</title>
        <link rel="canonical" href={url}/>
        <meta name="description" content={description}/>
        {author && <meta name="author" content={author || authorName}/>}
        {children}
    </Head>;
};
