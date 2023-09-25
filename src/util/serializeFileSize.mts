import { getSIPrefix } from './getSIPrefix.mts';

export const serializeFileSize = (value: number): string => {
  const [v, p] = getSIPrefix(value);
  switch (p.name) {
    case '':
      return `${v.toFixed(0)} B`;
    case 'kilo':
      return `${v.toFixed(v < 10 ? 1 : 0)} KB`;
    default:
      return `${v.toFixed(v < 10 ? 1 : 0)} ${p.symbol}B`;
  }
};
