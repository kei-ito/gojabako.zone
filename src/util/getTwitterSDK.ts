import {globalThis, Promise} from '../global';

interface TwitterSDK {
    widgets: {
        load: (element?: HTMLElement) => void,
    },
}

let promise: Promise<TwitterSDK> | null = null;

export const getTwitterSDK = async (): Promise<TwitterSDK> => {
    if (!promise) {
        promise = load();
    }
    return await promise;
};

const load = async (): Promise<TwitterSDK> => {
    if (!('document' in globalThis)) {
        return {widgets: {load: () => null}};
    }
    const {document} = globalThis;
    return await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.addEventListener('error', reject);
        script.addEventListener('load', () => {
            if ('twttr' in globalThis) {
                resolve((globalThis as unknown as {twttr: TwitterSDK}).twttr);
            }
        });
        script.async = true;
        script.src = 'https://platform.twitter.com/widgets.js';
        document.body.append(script);
    });
};
