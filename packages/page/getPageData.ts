import type {PageData} from '../../src/pageList';
import {Error} from '../es/global';
import {findPageData} from './findPageData';

export const getPageData = async (...args: Parameters<typeof findPageData>): Promise<PageData> => {
    const pageData = await findPageData(...args);
    if (!pageData) {
        throw new Error(`NoPageData: ${args[0]}`);
    }
    return pageData;
};
