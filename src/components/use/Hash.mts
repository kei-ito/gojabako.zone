import { useCallback, useEffect, useState } from 'react';
import { isClient } from '../../util/env.mts';

const eventName = 'apphashchange';

export const useHash = (): [string, (newHash?: string) => void] => {
  const [hash, setHash] = useState(isClient ? location.hash : '');
  const set = useCallback(() => setHash(location.hash), []);
  const syncHash = useCallback((newHash?: string) => {
    if (newHash) {
      history.replaceState(null, '', newHash);
    }
    dispatchEvent(new Event(eventName));
  }, []);
  useEffect(() => {
    const abc = new AbortController();
    addEventListener('hashchange', set, { signal: abc.signal });
    addEventListener(eventName, set, { signal: abc.signal });
    return () => abc.abort();
  }, [set]);
  return [hash, syncHash];
};
