import {Math} from './global';

const Ms1s = 1000;
const Ms1m = 60 * Ms1s;
const Ms1h = 60 * Ms1m;
const Ms1d = 24 * Ms1h;

export const serializeMs = (ms: number): string => {
    if (ms === 0) {
        return '0ms';
    }
    if (ms < 0) {
        return `-${serializeMs(-ms)}`;
    }
    if (ms < Ms1s) {
        return `${ms}ms`;
    }
    if (ms < Ms1m) {
        return `${(ms / Ms1s).toFixed(1)}s`;
    }
    if (ms < Ms1h) {
        return [
            `${Math.floor(ms / Ms1m)}m`,
            `${Math.floor((ms % Ms1m) / Ms1s)}s`.padStart(3, '0'),
        ].join('');
    }
    if (ms < Ms1d) {
        return [
            `${Math.floor(ms / Ms1h)}h`,
            `${Math.floor((ms % Ms1h) / Ms1m)}m`.padStart(3, '0'),
        ].join('');
    }
    return [
        `${Math.floor(ms / Ms1d)}d`,
        `${Math.floor((ms % Ms1d) / Ms1h)}h`.padStart(3, '0'),
        `${Math.floor((ms % Ms1h) / Ms1m)}m`.padStart(3, '0'),
    ].join('');
};
