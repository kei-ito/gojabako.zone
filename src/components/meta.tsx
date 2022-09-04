import type {MetaHTMLAttributes} from 'react';

const get = <T extends string>(name: T) => {
    const component = (
        props: Omit<MetaHTMLAttributes<HTMLMetaElement>, 'name'>,
    ) => <meta name={name} key={name} {...props}/>;
    component.displayName = `Meta[${name}]`;
    return component;
};

export const meta = {
    Description: get('description'),
    Author: get('author'),
    ThemeColor: get('theme-color'),
    OgTitle: get('og:title'),
    OgSiteName: get('og:site_name'),
    OgImage: get('og:image'),
    OgImageWidth: get('og:image:width'),
    OgImageHeight: get('og:image:height'),
    TwitterCard: get('twitter:card'),
    TwitterSite: get('twitter:site'),
    TwitterCreator: get('twitter:creator'),
    TwitterDescription: get('twitter:description'),
    TwitterImage: get('twitter:image'),
};
