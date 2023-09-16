import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import type { PageData } from '../../../../generated.pageList.mts';
import { DateString } from '../../ui/DateString';
import style from './style.module.scss';

export const PageLinkPublished = ({
  pathname,
  title,
  publishedAt,
}: PropsWithChildren<PageData>) => (
  <Link href={pathname || '/'} className={style.link}>
    {title}
    <span className={style.meta}>
      <DateString dateTime={publishedAt} /> 公開
    </span>
  </Link>
);

export const PageLinkUpdated = ({
  pathname,
  title,
  updatedAt,
}: PropsWithChildren<PageData>) => (
  <Link href={pathname || '/'} className={style.link}>
    {title}
    <span className={style.meta}>
      <DateString dateTime={updatedAt} /> 更新
    </span>
  </Link>
);
