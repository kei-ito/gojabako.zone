export const onResolve = <T,>(promise: Promise<T>, fn: (value: T) => void) => {
  // eslint-disable-next-line no-console
  promise.then(fn).catch(console.error);
};
