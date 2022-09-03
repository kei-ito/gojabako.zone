import * as fs from 'fs';
import {ignoreENOENT} from '@gjbkz/gojabako.zone-node-util';

export const statOrNull = async (...args: Parameters<typeof fs.promises.stat>) => {
    return await fs.promises.stat(...args).catch(ignoreENOENT);
};

export const statOrNullSync = (...args: Parameters<typeof fs.promises.stat>) => {
    try {
        return fs.statSync(...args);
    } catch (error) {
        return ignoreENOENT(error);
    }
};
