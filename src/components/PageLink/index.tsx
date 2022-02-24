import Link from 'next/link';
import {DateString} from '../DateString';
import type {PageData} from '../../pageList';
import {className} from './style.module.css';

export const PageLinkPublished = ({pathname, title, publishedAt}: PageData) => <Link href={pathname || '/'}>
    <a className={className.link}>
        {title}&ensp;
        <span className={className.meta}>
            <DateString dateTime={publishedAt}/> 公開
        </span>
    </a>
</Link>;

export const PageLinkUpdated = ({pathname, title, updatedAt}: PageData) => <Link href={pathname || '/'}>
    <a className={className.link}>
        {title}&ensp;
        <span className={className.meta}>
            <DateString dateTime={updatedAt}/> 更新
        </span>
    </a>
</Link>;
