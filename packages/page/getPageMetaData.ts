import type {PageData} from '../../src/pageList';
import {Error} from '../es/global';
import {findPageMetaData} from './findPageMetaData';

export const getPageMetaData = async (...args: Parameters<typeof findPageMetaData>): Promise<PageData> => {
    const pageData = await findPageMetaData(...args);
    if (!pageData) {
        throw new Error(`NoPageMetaData: ${args[0]}`);
    }
    return pageData;
};
