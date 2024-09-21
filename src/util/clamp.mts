export const clamp = (value: number, min: number, max: number) => {
  if (value < min) {
    return min;
  }
  if (max < value) {
    return max;
  }
  return value;
};
