import Link from 'next/link';
import type {PropsWithChildren} from 'react';
import type {PageData} from '../../../../generated.pageList.mjs';
import {DateString} from '../../ui/DateString';
import {className} from './style.module.css';

export const PageLinkPublished = (
    {pathname, title, publishedAt}: PropsWithChildren<PageData>,
) => <Link href={pathname || '/'}>
    <a className={className.link}>
        {title}
        &ensp;
        <span className={className.meta}>
            <DateString dateTime={publishedAt}/> 公開
        </span>
    </a>
</Link>;

export const PageLinkUpdated = (
    {pathname, title, updatedAt}: PropsWithChildren<PageData>,
) => <Link href={pathname || '/'}>
    <a className={className.link}>
        {title}
        &ensp;
        <span className={className.meta}>
            <DateString dateTime={updatedAt}/> 更新
        </span>
    </a>
</Link>;
