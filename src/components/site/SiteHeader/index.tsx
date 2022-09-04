import Link from 'next/link';
import type {FC} from 'react';
import {siteName} from '../../../../config.site.mjs';
import {AuthorLinks} from '../AuthorLinks';
import {Logo} from '../Logo';
import style from './style.module.scss';

export const SiteHeader: FC = () => <header className={style.header}>
    <div className={style.container}>
        <Link href="/">
            <a className={style.link}>
                <Logo className={style.logo} />
                <h1 className={style.title}>{siteName}</h1>
            </a>
        </Link>
        <div/>
        <AuthorLinks/>
    </div>
</header>;
