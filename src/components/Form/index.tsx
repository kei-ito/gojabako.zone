import type { FormHTMLAttributes, PropsWithChildren } from 'react';
import { classnames } from '../../util/classnames.mts';
import * as style from './style.module.scss';

export const Form = (
  props: PropsWithChildren<FormHTMLAttributes<HTMLFormElement>>,
) => <form {...props} className={classnames(style.form, props.className)} />;

export const FormGroup = (
  props: PropsWithChildren<FormHTMLAttributes<HTMLFieldSetElement>>,
) => (
  <fieldset {...props} className={classnames(style.form, props.className)} />
);
