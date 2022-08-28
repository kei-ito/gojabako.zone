import {isObject} from '@nlib/typing';

export const ignoreENOENT = (error: unknown) => {
    if (isObject(error) && error.code === 'ENOENT') {
        return null;
    }
    throw error;
};
