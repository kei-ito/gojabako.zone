import Link from 'next/link';
import type {FC} from 'react';
import type {PageData} from '../../../site/pageList';
import {DateString} from '../../ui/DateString';
import {className} from './style.module.css';

export const PageLinkPublished: FC<PageData> = ({pathname, title, publishedAt}) => <Link href={pathname || '/'}>
    <a className={className.link}>
        {title}
        &ensp;
        <span className={className.meta}>
            <DateString dateTime={publishedAt}/> 公開
        </span>
    </a>
</Link>;

export const PageLinkUpdated: FC<PageData> = ({pathname, title, updatedAt}) => <Link href={pathname || '/'}>
    <a className={className.link}>
        {title}
        &ensp;
        <span className={className.meta}>
            <DateString dateTime={updatedAt}/> 更新
        </span>
    </a>
</Link>;
