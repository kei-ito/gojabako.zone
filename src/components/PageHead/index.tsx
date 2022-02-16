import Head from 'next/head';
import type {PropsWithChildren} from 'react';
import {Error, JSON, URL} from '../../../packages/es/global';
import {authorName, siteDomain, siteName} from '../../../packages/site/constants';
import {pageImages} from '../../pageImageList';
import {usePageData} from '../../use/PageData';
import {meta} from '../../util/metaTag';

export interface PageHeadProps {
    title: string,
    description: string,
    pathname: string,
}

export const PageHead = (
    {title, description, pathname, children}: PropsWithChildren<PageHeadProps>,
) => {
    const {publishedAt, updatedAt} = usePageData(pathname);
    const pageImage = pageImages[pathname];
    if (!pageImage) {
        throw new Error(`NoPageImage: "${pathname}"`);
    }
    const baseUrl = `https://${siteDomain}`;
    const url = new URL(pathname, baseUrl).href;
    const coverUrl = new URL(pageImage.path, baseUrl).href;
    return <Head>
        <title>{title === siteName ? title : `${title} ・ ${siteName}`}</title>
        <link rel="canonical" href={url}/>
        <meta.OgTitle content={title}/>
        <meta.Description content={description}/>
        <meta.TwitterDescription content={description}/>
        <meta.OgImage content={coverUrl}/>
        <meta.TwitterImage content={coverUrl}/>
        <meta.OgImageWidth content={`${pageImage.width}`}/>
        <meta.OgImageHeight content={`${pageImage.height}`}/>
        <meta.TwitterCard content="summary_large_image"/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            'author': {
                '@type': 'Person',
                'name': authorName,
                'url': baseUrl,
            },
            'datePublished': publishedAt,
            'dateModified': updatedAt,
            'headline': title,
            'image': coverUrl,
            'publisher': {
                '@type': 'Organization',
                'name': siteName,
                'logo': new URL('/logo.png', baseUrl).href,
            },
        })}}/>
        {children}
    </Head>;
};
