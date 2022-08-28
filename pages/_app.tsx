import type {AppProps} from 'next/app';
import {SiteFooter} from '../packages/components/site/SiteFooter';
import {SiteHeader} from '../packages/components/site/SiteHeader';
import './globals.scss';
import './app.css';

const Root = ({Component, pageProps}: AppProps) => <>
    <SiteHeader/>
    <Component {...pageProps}/>
    <SiteFooter/>
</>;

export default Root;
