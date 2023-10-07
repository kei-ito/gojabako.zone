import { useEffect, useState } from 'react';

export const useLastValue = <T, S>(value: T, fallback: S): S | T => {
  const [lastValue, setLastValue] = useState<S | T>(fallback);
  useEffect(() => () => setLastValue(value), [value, lastValue]);
  return lastValue;
};
