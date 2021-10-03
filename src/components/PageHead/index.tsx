import Head from 'next/head';
import type {PropsWithChildren} from 'react';
import {URL} from '../../global';
import {authorName, baseUrl, siteName} from '../../util/constants';

export interface PageHeadProps {
    title: string,
    description: string,
    pathname: string,
    author?: string,
}

export const PageHead = (
    {title, description, pathname, author, children}: PropsWithChildren<PageHeadProps>,
) => {
    const url = new URL(pathname, baseUrl).href;
    return <Head>
        <title>{title} ・ {siteName}</title>
        <link rel="canonical" href={url}/>
        <meta name="description" content={description}/>
        {author && <meta name="author" content={author || authorName}/>}
        {children}
    </Head>;
};
