import Head from 'next/head';
import type {PropsWithChildren} from 'react';
import {URL} from '../../../packages/es/global';
import {siteDomain, siteName} from '../../../packages/site/constants';
import {pageImages} from '../../pageImageList';
import {meta} from '../../util/metaTag';

export interface PageHeadProps {
    title: string,
    description: string,
    pathname: string,
}

export const PageHead = (
    {title, description, pathname, children}: PropsWithChildren<PageHeadProps>,
) => {
    const pageImage = pageImages[pathname || '/'];
    const url = new URL(pathname, `https://${siteDomain}`).href;
    const coverUrl = new URL(pageImage.path, `https://${siteDomain}`).href;
    return <Head>
        <title>{title} ・ {siteName}</title>
        <link rel="canonical" href={url}/>
        <meta.OgTitle content={title}/>
        <meta.Description content={description}/>
        <meta.TwitterDescription content={description}/>
        <meta.OgImage content={coverUrl}/>
        <meta.TwitterImage content={coverUrl}/>
        <meta.OgImageWidth content={`${pageImage.width}`}/>
        <meta.OgImageHeight content={`${pageImage.height}`}/>
        <meta.TwitterCard content="summary_large_image"/>
        {children}
    </Head>;
};
