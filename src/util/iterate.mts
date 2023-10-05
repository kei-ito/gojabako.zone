export const iterate = function* <T>(iterable: Iterable<T>): Generator<T> {
  for (const item of iterable) {
    yield item;
  }
};
