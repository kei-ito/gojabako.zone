import Link from 'next/link';
import type { HTMLAttributes } from 'react';
import { classnames } from '../../util/classnames.mts';
import { site } from '../../util/site.mts';
import { Logo } from '../Logo';
import * as style from './style.module.scss';

export const SiteHeader = (props: HTMLAttributes<HTMLElement>) => (
  <header {...props} className={classnames(style.container, props.className)}>
    <div>
      <Link href="/">
        <Logo className={style.logo} />
        <span>{site.name}</span>
      </Link>
      <Link href="/author">
        <span>Kei Ito</span>
      </Link>
    </div>
  </header>
);
