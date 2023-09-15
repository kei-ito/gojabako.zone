import Link from 'next/link';
import type { HTMLAttributes } from 'react';
import { classnames } from '../../util/classnames.mjs';
import { Logo } from '../Logo';
import * as style from './style.module.scss';

export const SiteHeader = (props: HTMLAttributes<HTMLElement>) => (
  <header {...props} className={classnames(style.container, props.className)}>
    <div>
      <Link href="/">
        <Logo />
        <span>Gojabako Zone</span>
      </Link>
      <Link target="_blank" href="https://github.com/gjbkz" title="GitHub">
        Kei Ito
      </Link>
    </div>
  </header>
);
