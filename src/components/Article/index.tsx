import type { PropsWithChildren } from 'react';
import { isClient } from '../../util/env.mts';
import { ArticleHandlers } from './Handlers';
import * as style from './style.module.scss';

export const Article = ({ children }: PropsWithChildren) => (
  <article className={style.container}>
    {children}
    {isClient && <ArticleHandlers />}
  </article>
);
