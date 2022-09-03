import {useRouter} from 'next/router';

const baseUrl = new URL('https://www.spina-pesce.com');
export const useCurrentUrl = () => new URL(useRouter().asPath, baseUrl);
