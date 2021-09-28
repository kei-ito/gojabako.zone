import type {AppProps} from 'next/app';
import {Header} from '../components/Header';
import {Footer} from '../components/Footer';
import '../app.css';

const Root = ({Component, pageProps}: AppProps) => <>
    <Header/>
    <Component {...pageProps}/>
    <Footer/>
</>;

export default Root;
