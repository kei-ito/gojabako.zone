import { isClient } from './env.mts';
import { site } from './site.mts';

export const getCurrentUrl = () =>
  // eslint-disable-next-line no-restricted-globals
  new URL(isClient ? location.href : site.baseUrl);
