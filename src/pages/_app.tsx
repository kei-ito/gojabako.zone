import type {AppProps} from 'next/app';
import {SiteFooter} from '../components/site/SiteFooter';
import {SiteHeader} from '../components/site/SiteHeader';
import '../app.css';

const Root = ({Component, pageProps}: AppProps) => <>
    <SiteHeader/>
    <Component {...pageProps}/>
    <SiteFooter/>
</>;

export default Root;
