export const sign = <T1, T2, T3>(
  value: number,
  negative: T1,
  zero: T2,
  positive: T3,
) => {
  if (value < 0) {
    return negative;
  } else if (0 < value) {
    return positive;
  } else if (value === 0) {
    return zero;
  }
  throw new Error(`UnexpectedNaN: ${value}`);
};
