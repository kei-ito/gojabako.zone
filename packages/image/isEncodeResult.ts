import {createTypeChecker, isNonNegativeSafeInteger} from '@nlib/typing';
import type {ImageData} from './isImageData';
import {isImageData} from './isImageData';

export interface EncodeResult {
    version: number,
    source: ImageData,
    results: Array<ImageData>,
}

export const isEncodeResult = createTypeChecker<EncodeResult>('EncodeResult', {
    version: isNonNegativeSafeInteger,
    source: isImageData,
    results: isImageData.array,
});
