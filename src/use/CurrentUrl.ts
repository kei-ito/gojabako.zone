import {useRouter} from 'next/router';
import {URL} from '../global';

const baseUrl = new URL('https://www.spina-pesce.com');
export const useCurrentUrl = () => new URL(useRouter().asPath, baseUrl);
