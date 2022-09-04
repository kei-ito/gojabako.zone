import Link from 'next/link';
import type {FC} from 'react';
import {siteName} from '../../../../config.site.mjs';
import {AuthorLinks} from '../AuthorLinks';
import {Logo} from '../Logo';
import {className} from './style.module.css';

export const SiteHeader: FC = () => <header className={className.header}>
    <div className={className.container}>
        <Link href="/">
            <a className={className.link}>
                <Logo className={className.logo} />
                <h1 className={className.title}>{siteName}</h1>
            </a>
        </Link>
        <div/>
        <AuthorLinks/>
    </div>
</header>;
