export const minmax = (values: Iterable<number>): [number, number] => {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
  }
  return [min, max];
};
