import Link from 'next/link';
import {Logo} from '../Logo';
import {className} from './style.module.css';

export const Header = () => <header className={className.header}>
    <div className={className.container}>
        <Link href="/">
            <a className={className.title}>
                <Logo className={className.logo}/>
                <h1>Kei Ito</h1>
            </a>
        </Link>
        <div className={className.spacer}/>
        <a className={className.sns} href="https://github.com/kei-ito">GitHub</a>
        <a className={className.sns} href="https://twitter.com/wemotter">Twitter</a>
    </div>
</header>;
