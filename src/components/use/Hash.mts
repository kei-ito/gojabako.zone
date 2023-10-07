import { isString } from '@nlib/typing';
import { useCallback, useEffect, useState } from 'react';
import { isClient } from '../../util/env.mts';

const eventName = '_hashchange';
const get = () => (isClient ? decodeURIComponent(location.hash) : '');

export const useHash = (): [string, (newHash?: string) => void] => {
  const [hash, setHash] = useState(get());
  const set = useCallback(() => setHash(get()), []);
  const syncHash = useCallback((newHash?: string) => {
    if (isString(newHash)) {
      const url = new URL(location.href);
      if (url.hash === newHash && !newHash) {
        return;
      }
      url.hash = url.hash === newHash ? '' : newHash;
      history.replaceState(null, '', url);
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
