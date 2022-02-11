import Head from 'next/head';
import type {PropsWithChildren} from 'react';
import {URL} from '../../../packages/es/global';
import {siteDomain, siteName} from '../../../packages/site/constants';
import {getPageData} from '../../util/getPageData';
import {meta} from '../../util/metaTag';

export interface PageHeadProps {
    title: string,
    description: string,
    pathname: string,
}

export const PageHead = (
    {title, description, pathname, children}: PropsWithChildren<PageHeadProps>,
) => {
    const {cover} = getPageData(pathname);
    const url = new URL(pathname, `https://${siteDomain}`).href;
    const coverUrl = new URL(cover.path, `https://${siteDomain}`).href;
    return <Head>
        <title>{title} ・ {siteName}</title>
        <link rel="canonical" href={url}/>
        <meta.Description content={description}/>
        <meta.TwitterCard content="summary_large_image"/>
        <meta.OgImage content={coverUrl}/>
        <meta.OgImageWidth content={`${cover.width}`}/>
        <meta.OgImageHeight content={`${cover.height}`}/>
        {children}
    </Head>;
};
