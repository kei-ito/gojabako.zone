import {Error, Math, Number} from './global';

const BASE = 1024;

export const serializeSize = (size: bigint | number): string => {
    if (size < 0) {
        return `-${serializeSize(-size)}`;
    }
    if (size === 0) {
        return `${size}B`;
    }
    const log = Math.log2(Number(size)) * 0.1;
    const scale = Math.floor(log);
    const unit = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'][scale];
    if (!unit) {
        throw new Error(`NoUnit: ${size}`);
    }
    return `${(BASE ** (log - scale)).toFixed(scale ? 1 : 0)}${unit}`;
};
