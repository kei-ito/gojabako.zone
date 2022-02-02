import {Number} from './global';

export const isInteger = (input: unknown): input is number => Number.isInteger(input);
export const isPositiveInteger = (input: unknown): input is number => isInteger(input) && 0 < input;
