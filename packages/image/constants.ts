import type sharp from 'sharp';
export type ImageFormat = keyof sharp.FormatEnum;
export const ImageProcessorVersion = 'v1';
export const ImageProcessorHashEncoding = 'base64url';
export const ImageProcessorResultFileName = 'results.json';
export const ImageProcessorWidthList = [300, 400, 500, 600, 800, 1000, 1200, 1500, 1800];
