export const siteName = 'Gojabako Zone';
export const baseUrl = new URL('https://gojabako.zone/');
export const repositoryUrl = new URL('https://github.com/gjbkz/gojabako.zone/');
export const logoPathD =
  'M0 0H2V1H1V2H2V4H0zM3 0H5V4H3V2H4V1H3zM6 0H8V4H7V3H6z';
export const pagePathToIri = (pagePath: string): string => {
  return `gjbkz://${baseUrl.hostname}${pagePath}`;
};
