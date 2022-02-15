import {isObjectLike} from '../es/isObjectLike';

export const ignoreENOENT = (error: unknown) => {
    if (isObjectLike(error) && error.code === 'ENOENT') {
        return null;
    }
    throw error;
};
