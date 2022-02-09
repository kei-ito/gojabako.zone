import {Object} from './global';

export const nullaryCache = <T>(fn: () => T) => {
    let cached: {value: T} | null = null;
    const clearCache = () => {
        cached = null;
    };
    return Object.assign(
        () => {
            if (!cached) {
                cached = {value: fn()};
            }
            return cached.value;
        },
        {clearCache},
    );
};
