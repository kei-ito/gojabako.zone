import type { HTMLAttributes } from 'react';
import { classnames } from '../../util/classnames.mts';
import * as style from './style.module.scss';

export interface ToggleProps extends HTMLAttributes<HTMLButtonElement> {
  state: boolean;
  disabled?: boolean;
}

export const Toggle = ({ state, ...props }: ToggleProps) => (
  <button
    {...props}
    className={classnames(style.container, props.className)}
    data-state={state ? '1' : '0'}
  />
);
