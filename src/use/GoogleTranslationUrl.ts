import {URL} from '../global';

export const useGoogleTranslationUrl = (pageUrl: URL) => {
    const translationUrl = new URL('https://translate.google.com/translate');
    translationUrl.searchParams.set('sl', 'ja');
    translationUrl.searchParams.set('u', pageUrl.href);
    return translationUrl;
};
