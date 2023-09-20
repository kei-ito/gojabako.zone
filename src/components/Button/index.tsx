import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  PropsWithChildren,
} from 'react';
import { classnames } from '../../util/classnames.mts';
import * as style from './style.module.scss';

export const Button = (
  props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>,
) => (
  <button {...props} className={classnames(style.button, props.className)} />
);

export const Buttons = (
  props: PropsWithChildren<HTMLAttributes<HTMLDivElement>>,
) => <div {...props} className={classnames(style.buttons, props.className)} />;
