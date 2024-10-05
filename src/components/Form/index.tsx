import type {
  FieldsetHTMLAttributes,
  FormHTMLAttributes,
  PropsWithChildren,
} from "react";
import { classnames } from "../../util/classnames.ts";
import * as style from "./style.module.scss";

export const Form = (
  props: PropsWithChildren<FormHTMLAttributes<HTMLFormElement>>,
) => <form {...props} className={classnames(style.form, props.className)} />;

export const FieldSet = (
  props: PropsWithChildren<FieldsetHTMLAttributes<HTMLFieldSetElement>>,
) => (
  <fieldset {...props} className={classnames(style.form, props.className)} />
);
