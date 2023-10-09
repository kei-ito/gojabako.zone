import type { ReadonlyURLSearchParams } from 'next/navigation';
import { isClient } from './env.mts';
import { site } from './site.mts';

interface Fn {
  (): URL;
  defaultSearchParams?: ReadonlyURLSearchParams | URLSearchParams;
}

export const getCurrentUrl: Fn = () => {
  if (isClient) {
    // eslint-disable-next-line no-restricted-globals
    return new URL(location.href);
  }
  const { defaultSearchParams } = getCurrentUrl;
  const url = new URL(site.baseUrl);
  if (defaultSearchParams) {
    for (const [key, value] of defaultSearchParams) {
      url.searchParams.set(key, value);
    }
  }
  return url;
};
