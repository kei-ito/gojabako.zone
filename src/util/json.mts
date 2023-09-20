export const ignore =
  (...keys: Array<string>) =>
  <T,>(key: string, v: T) =>
    keys.includes(key) ? undefined : v;
