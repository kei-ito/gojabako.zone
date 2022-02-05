import * as fs from 'fs';
import {isObjectLike} from '../es/isObjectLike';

export const statsOrNull = async (...args: Parameters<typeof fs.promises.stat>) => {
    return await fs.promises.stat(...args).catch(onError);
};

export const statsOrNullSync = (...args: Parameters<typeof fs.promises.stat>) => {
    try {
        return fs.statSync(...args);
    } catch (error) {
        return onError(error);
    }
};

const onError = (error: unknown) => {
    if (isObjectLike(error) && error.code === 'ENOENT') {
        return null;
    }
    throw error;
};
