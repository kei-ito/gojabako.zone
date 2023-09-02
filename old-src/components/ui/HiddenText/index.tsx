import type { PropsWithChildren } from 'react';
import style from './style.module.scss';

interface Props {}

export const HiddenText = ({ children }: PropsWithChildren<Props>) => (
  <span className={style.text}>{children}</span>
);
