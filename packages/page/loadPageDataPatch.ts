import * as fs from 'fs';
import {JSON} from '../es/global';
import {isObjectLike} from '../es/isObjectLike';
import {isDateString, isUrlString} from '../es/isString';
import {ignoreENOENT} from '../fs/ignoreENOENT';
import type {PageDataPatch} from './findPageData';

export const loadPageDataPatch = async (pageFileAbsolutePath: string): Promise<Partial<PageDataPatch>> => {
    const result: Partial<PageDataPatch> = {};
    const patchFilePath = `${pageFileAbsolutePath}.json`;
    const jsonString = await fs.promises.readFile(patchFilePath, 'utf-8').catch(ignoreENOENT);
    if (jsonString) {
        const parsed: unknown = JSON.parse(jsonString);
        if (isObjectLike(parsed)) {
            const {publishedAt, originalUrl} = parsed;
            if (isDateString(publishedAt)) {
                result.publishedAt = publishedAt;
            }
            if (isUrlString(originalUrl)) {
                result.originalUrl = originalUrl;
            }
        }
    }
    return result;
};
