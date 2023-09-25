export interface SIPrefix {
  name: string;
  symbol: string;
  scale: number;
}
const SIPrefixBase: SIPrefix = { name: '', symbol: '', scale: 1 };
const SIPrefixList: Array<SIPrefix | undefined> = [
  { name: 'yocto', symbol: 'y', scale: 1e-24 },
  { name: 'zepto', symbol: 'z', scale: 1e-21 },
  { name: 'atto', symbol: 'a', scale: 1e-18 },
  { name: 'femto', symbol: 'f', scale: 1e-15 },
  { name: 'pico', symbol: 'p', scale: 1e-12 },
  { name: 'nano', symbol: 'n', scale: 1e-9 },
  { name: 'micro', symbol: 'μ', scale: 1e-6 },
  { name: 'milli', symbol: 'm', scale: 1e-3 },
  SIPrefixBase,
  { name: 'kilo', symbol: 'k', scale: 1e3 },
  { name: 'mega', symbol: 'M', scale: 1e6 },
  { name: 'giga', symbol: 'G', scale: 1e9 },
  { name: 'tera', symbol: 'T', scale: 1e12 },
  { name: 'peta', symbol: 'P', scale: 1e15 },
  { name: 'exa', symbol: 'E', scale: 1e18 },
  { name: 'zetta', symbol: 'Z', scale: 1e21 },
  { name: 'yotta', symbol: 'Y', scale: 1e24 },
];
const SIPrefixListBaseIndex = SIPrefixList.indexOf(SIPrefixBase);

export const getSIPrefix = (value: number): [number, SIPrefix] => {
  if (0 <= value) {
    if (value === 0) {
      return [0, SIPrefixBase];
    }
    const prefixIndex =
      SIPrefixListBaseIndex + Math.floor(Math.log10(value) / 3);
    const prefix = SIPrefixList[prefixIndex];
    if (prefix) {
      return [value / prefix.scale, prefix];
    }
  }
  throw new Error('InvalidValue');
};
