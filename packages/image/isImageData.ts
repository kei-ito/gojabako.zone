import {createTypeChecker, isPositiveSafeInteger, isString} from '@nlib/typing';

export interface ImageData {
    path: string,
    hash: string,
    width: number,
    height: number,
    size: number,
}

export const isImageData = createTypeChecker<ImageData>('ImageData', {
    path: isString,
    hash: isString,
    width: isPositiveSafeInteger,
    height: isPositiveSafeInteger,
    size: isPositiveSafeInteger,
});
