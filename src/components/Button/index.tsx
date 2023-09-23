import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  PropsWithChildren,
} from 'react';
import { classnames } from '../../util/classnames.mts';
import * as style from './style.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: 'active' | 'focus' | 'hover';
}

export const Button = ({ state, ...props }: PropsWithChildren<ButtonProps>) => (
  <button
    {...props}
    className={classnames(style.button, state && style[state], props.className)}
  />
);

export const Buttons = (
  props: PropsWithChildren<HTMLAttributes<HTMLDivElement>>,
) => <div {...props} className={classnames(style.buttons, props.className)} />;
