import {serializeMs} from './serializeMs';

const LN1000 = Math.log(1000);
const log1min = Math.log(60000000000) / LN1000;

export const serializeNs = (ns: bigint | number): string => {
    if (ns === 0) {
        return '0ns';
    }
    if (ns < 0) {
        return `-${serializeNs(-ns)}`;
    }
    const log = Math.log(Number(ns)) / LN1000;
    if (log <= log1min) {
        const scale = Math.floor(log);
        const unit = ['ns', 'us', 'ms', 's'][scale];
        return `${(1000 ** (log - scale)).toFixed(scale ? 1 : 0)}${unit}`;
    }
    return serializeMs(Math.round(Number(ns) / 1000000));
};
