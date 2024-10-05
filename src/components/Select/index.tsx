import type { PropsWithChildren, SelectHTMLAttributes } from "react";
import { classnames } from "../../util/classnames.ts";
import * as style from "./style.module.scss";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = (props: PropsWithChildren<SelectProps>) => (
	<select {...props} className={classnames(style.container, props.className)} />
);

// let caret =
//   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 10 10"><path d="M-3 -1.5L0 1.5L3 -1.5" fill="none" stroke="#333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// caret = `url('data:image/svg+xml,${encodeURIComponent(caret)}')`;
// console.info(caret);
