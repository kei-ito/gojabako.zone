import Link from 'next/link';
import packageJson from '../../../package.json';
import {AuthorLinks} from '../AuthorLinks';
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
        <div/>
        <AuthorLinks/>
    </div>
</header>;
