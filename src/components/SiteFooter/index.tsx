import type { HTMLAttributes } from 'react';
import { classnames } from '../../util/classnames.mjs';
import * as style from './style.module.scss';

export const SiteFooter = (props: HTMLAttributes<HTMLElement>) => (
  <footer {...props} className={classnames(style.container, props.className)}>
    <section>
      <div>© 2013- Kei Ito</div>
    </section>
  </footer>
);
