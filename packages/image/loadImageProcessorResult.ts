import * as fs from 'fs';
import {JSON} from '../es/global';
import {isObjectLike} from '../es/isObjectLike';
import type {ImageProcessorResult} from './isImageProcessorResult';
import {isImageProcessorResult} from './isImageProcessorResult';

export const loadImageProcessorResult = async (
    resultFilePath: string,
): Promise<ImageProcessorResult | null> => {
    const json = await fs.promises.readFile(resultFilePath, 'utf8').catch((error) => {
        if (isObjectLike(error) && error.code === 'ENOENT') {
            return null;
        }
        throw error;
    });
    if (!json) {
        return null;
    }
    try {
        const parsed: unknown = JSON.parse(json);
        return isImageProcessorResult(parsed) ? parsed : null;
    } catch {
        // do nothing
    }
    return null;
};
