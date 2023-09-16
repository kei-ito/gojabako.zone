import type { PropsWithChildren } from 'react';
import { HighlightCode } from '../HighlightCode';
import * as style from './style.module.scss';

export const Article = ({ children }: PropsWithChildren) => (
  <article className={style.container}>
    {children}
    <HighlightCode />
  </article>
);
