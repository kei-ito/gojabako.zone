import * as fs from 'fs';
import {JSON} from '../es/global';
import {isObjectLike} from '../es/isObjectLike';
import {isDateString, isString, isUrlString} from '../es/isString';
import {ignoreENOENT} from '../fs/ignoreENOENT';
import type {PageMetaDataPatch} from './findPageMetaData';

export const loadPageMetaDataPatch = async (pageFileAbsolutePath: string): Promise<Partial<PageMetaDataPatch>> => {
    const result: Partial<PageMetaDataPatch> = {};
    const patchFilePath = `${pageFileAbsolutePath}.json`;
    const jsonString = await fs.promises.readFile(patchFilePath, 'utf-8').catch(ignoreENOENT);
    if (jsonString) {
        const parsed: unknown = JSON.parse(jsonString);
        if (isObjectLike(parsed)) {
            const {publishedAt, archiveOf, title, description} = parsed;
            if (isString(title) && title) {
                result.title = title;
            }
            if (isDateString(publishedAt)) {
                result.publishedAt = publishedAt;
            }
            if (isUrlString(archiveOf)) {
                result.archiveOf = archiveOf;
            }
            if (isString(description) && description) {
                result.description = description;
            }
        }
    }
    return result;
};
