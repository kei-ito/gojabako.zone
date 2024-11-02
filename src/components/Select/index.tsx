import type { PropsWithChildren, SelectHTMLAttributes } from "react";
import { classnames } from "../../util/classnames.ts";
import * as style from "./style.module.scss";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = (props: PropsWithChildren<SelectProps>) => (
	<select {...props} className={classnames(style.container, props.className)} />
);
