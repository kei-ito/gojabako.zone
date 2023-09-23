import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  PropsWithChildren,
} from 'react';
import { classnames } from '../../util/classnames.mts';
import * as style from './style.module.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: 'active' | 'focus' | 'hover';
}

const Button = ({ state, ...props }: PropsWithChildren<ButtonProps>) => (
  <button
    {...props}
    className={classnames(style.button, state && style[state], props.className)}
  />
);

export const PrimaryButton = (props: PropsWithChildren<ButtonProps>) => (
  <Button {...props} className={classnames(style.primary, props.className)} />
);

export const SecondaryButton = (props: PropsWithChildren<ButtonProps>) => (
  <Button {...props} className={classnames(style.secondary, props.className)} />
);

export const TextButton = (props: PropsWithChildren<ButtonProps>) => (
  <Button {...props} className={classnames(style.text, props.className)} />
);

export const Buttons = (
  props: PropsWithChildren<HTMLAttributes<HTMLDivElement>>,
) => <div {...props} className={classnames(style.buttons, props.className)} />;
