import { useCallback, useEffect, useState } from 'react';

export const useHash = (): [string, () => void] => {
  const [hash, setHash] = useState('');
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
