import Link from 'next/link';
import type { PageData } from '../../util/type.mts';
import * as style from './style.module.scss';

interface PageLinkProps {
  page: PageData;
  mode?: 'publish' | 'update';
}

export const PageLink = ({ page, mode = 'publish' }: PageLinkProps) => {
  const d = new Date(mode === 'publish' ? page.publishedAt : page.updatedAt);
  const date = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  return (
    <Link href={page.path} className={style.container}>
      <span>{page.title}</span>
      <time dateTime={page.publishedAt}>
        {date}
        {mode === 'publish' ? '公開' : '更新'}
      </time>
    </Link>
  );
};
