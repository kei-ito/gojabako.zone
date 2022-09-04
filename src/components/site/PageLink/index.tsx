import Link from 'next/link';
import type {PropsWithChildren} from 'react';
import type {PageData} from '../../../../generated.pageList.mjs';
import {DateString} from '../../ui/DateString';
import style from './style.module.scss';

export const PageLinkPublished = (
    {pathname, title, publishedAt}: PropsWithChildren<PageData>,
) => <Link href={pathname || '/'}>
    <a className={style.link}>
        {title}
        &ensp;
        <span className={style.meta}>
            <DateString dateTime={publishedAt}/> 公開
        </span>
    </a>
</Link>;

export const PageLinkUpdated = (
    {pathname, title, updatedAt}: PropsWithChildren<PageData>,
) => <Link href={pathname || '/'}>
    <a className={style.link}>
        {title}
        &ensp;
        <span className={style.meta}>
            <DateString dateTime={updatedAt}/> 更新
        </span>
    </a>
</Link>;
