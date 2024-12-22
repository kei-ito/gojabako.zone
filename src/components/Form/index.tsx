import type {
	FieldsetHTMLAttributes,
	FormHTMLAttributes,
	PropsWithChildren,
} from "react";
import { classnames } from "../../util/classnames.ts";
import * as css from "./style.module.css";

export const Form = (
	props: PropsWithChildren<FormHTMLAttributes<HTMLFormElement>>,
) => <form {...props} className={classnames(css.form, props.className)} />;

export const FieldSet = (
	props: PropsWithChildren<FieldsetHTMLAttributes<HTMLFieldSetElement>>,
) => <fieldset {...props} className={classnames(css.form, props.className)} />;
