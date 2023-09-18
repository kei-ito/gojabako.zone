export const siteName = 'Gojabako Zone';
export const baseUrl = new URL('https://gojabako.zone/');
export const repositoryUrl = new URL('https://github.com/gjbkz/gojabako.zone/');
export const pagePathToIri = (pagePath: string): string => {
  return `gjbkz://${baseUrl.hostname}${pagePath}`;
};
