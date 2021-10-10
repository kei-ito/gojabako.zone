import {globalThis} from '../global';

interface TwitterSDK {
    widgets: {
        load: () => void,
    },
}

export const getTwitterSDK = () => (globalThis as unknown as {twttr?: TwitterSDK}).twttr;
