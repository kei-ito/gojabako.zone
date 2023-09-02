import Head from 'next/head';
import type { PropsWithChildren } from 'react';
import { authorName, siteDomain, siteName } from '../../../../config.site.mjs';
import { meta } from '../../meta';
import { usePageData } from '../../../hooks/usePageData';
import { pageImages } from '../../../../generated.pageImageList.mjs';

export interface HtmlHeadProps {
  pathname: string;
  description?: string;
}

// eslint-disable-next-line max-lines-per-function
export const HtmlHead = ({
  pathname,
  description: givenDescription,
  children,
}: PropsWithChildren<HtmlHeadProps>) => {
  const {
    title,
    publishedAt,
    updatedAt,
    description = givenDescription,
  } = usePageData(pathname);
  const pageImage = pageImages[pathname];
  if (!pageImage) {
    throw new Error(`NoPageImage: "${pathname}"`);
  }
  const baseUrl = `https://${siteDomain}`;
  const url = new URL(pathname, baseUrl).href;
  const coverUrl = new URL(pageImage.path, baseUrl).href;
  return (
    <Head>
      <title>{title === siteName ? title : `${title} ・ ${siteName}`}</title>
      <link rel="canonical" href={url} />
      <meta.OgTitle content={title} />
      {description && <meta.Description content={description} />}
      {description && <meta.TwitterDescription content={description} />}
      <meta.OgImage content={coverUrl} />
      <meta.TwitterImage content={coverUrl} />
      <meta.OgImageWidth content={`${pageImage.width}`} />
      <meta.OgImageHeight content={`${pageImage.height}`} />
      <meta.TwitterCard content="summary_large_image" />
      <meta.ThemeColor content="#cbd5e1" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />
      {children}
    </Head>
  );
};
