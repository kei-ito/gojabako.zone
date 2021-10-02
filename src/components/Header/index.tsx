import Link from 'next/link';
import packageJson from '../../../package.json';
import {FlexGrow} from '../FlexGrow';
import {Logo} from '../Logo';
import {className} from './style.module.css';

export const Header = () => <header className={className.header}>
    <div className={className.container}>
        <Link href="/">
            <a className={className.titleLink}>
                <Logo className={className.logo}/>
                <h1 className={className.title}>{packageJson.siteName}</h1>
            </a>
        </Link>
        <FlexGrow/>
        <a className={className.sns} href="https://github.com/kei-ito">GitHub</a>
        <a className={className.sns} href="https://twitter.com/gjbkz">Twitter</a>
    </div>
</header>;
