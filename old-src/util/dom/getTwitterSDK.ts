interface TwitterSDK {
  widgets: {
    load: (element?: HTMLElement) => void;
  };
}

let promise: Promise<TwitterSDK> | null = null;

export const getTwitterSDK = async (): Promise<TwitterSDK> => {
  if (!promise) {
    promise = load();
  }
  return await promise;
};

const load = async (): Promise<TwitterSDK> => {
  // eslint-disable-next-line no-undef, @typescript-eslint/no-unnecessary-condition
  const g = globalThis || {};
  if (!('document' in g)) {
    return { widgets: { load: () => null } };
  }
  const { document } = g;
  return await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.addEventListener('error', reject);
    script.addEventListener('load', () => {
      if ('twttr' in g) {
        resolve((g as unknown as { twttr: TwitterSDK }).twttr);
      }
    });
    script.async = true;
    script.src = 'https://platform.twitter.com/widgets.js';
    document.body.append(script);
  });
};
