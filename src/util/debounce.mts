import { noop } from './noop.mts';

export const debounce = <A extends Array<unknown>>(
  fn: (...args: A) => void,
  debounceMs: number,
) => {
  let timerId = setTimeout(noop);
  const abort = () => clearTimeout(timerId);
  const debouncedFn = (...args: A) => {
    abort();
    timerId = setTimeout(() => fn(...args), debounceMs);
  };
  return Object.assign(debouncedFn, { abort });
};
