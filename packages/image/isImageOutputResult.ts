import {isPositiveInteger} from '../es/isInteger';
import {isObjectLike} from '../es/isObjectLike';
import {isString} from '../es/isString';
import type {ImageFormat} from './constants';

export interface ImageOutputResult {
    name: string,
    format: ImageFormat,
    width: number,
}

export const isImageOutputResult = (input: unknown): input is ImageOutputResult => isObjectLike(input)
&& isString(input.name)
&& isString(input.format)
&& isPositiveInteger(input.width);
