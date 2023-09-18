import { useCallback, useEffect, useState } from 'react';
import { isClient } from '../../util/env.mts';

export const useHash = (): [string, () => void] => {
  const [hash, setHash] = useState(isClient ? location.hash : '');
  const syncHash = useCallback(() => setHash(location.hash), []);
  useEffect(() => {
    const abc = new AbortController();
    addEventListener('hashchange', syncHash, {
      signal: abc.signal,
    });
    syncHash();
    return () => abc.abort();
  }, [syncHash]);
  return [hash, syncHash];
};
