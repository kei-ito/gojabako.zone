export const getSingle = <T,>(a: Array<T>): T | null =>
  a.length === 1 ? a[0] : null;
