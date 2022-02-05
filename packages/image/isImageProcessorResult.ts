import {Array} from '../es/global';
import {isPositiveInteger} from '../es/isInteger';
import {isObjectLike} from '../es/isObjectLike';
import {isString} from '../es/isString';
import type {ImageOutputResult} from './isImageOutputResult';
import {isImageOutputResult} from './isImageOutputResult';

export interface ImageProcessorResult {
    hash: string,
    version: string,
    relativePath: string,
    format: string,
    width: number,
    height: number,
    results: Array<ImageOutputResult>,
}

export const isImageProcessorResult = (input: unknown): input is ImageProcessorResult => isObjectLike(input)
&& isString(input.hash)
&& isString(input.version)
&& isString(input.relativePath)
&& isString(input.format)
&& isPositiveInteger(input.width)
&& isPositiveInteger(input.height)
&& Array.isArray(input.results)
&& input.results.every((item) => isImageOutputResult(item));
