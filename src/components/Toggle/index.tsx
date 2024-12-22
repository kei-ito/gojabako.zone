import type { HTMLAttributes } from "react";
import { classnames } from "../../util/classnames.ts";
import * as css from "./style.module.css";

export interface ToggleProps extends HTMLAttributes<HTMLButtonElement> {
	state: boolean;
	disabled?: boolean;
}

export const Toggle = ({ state, ...props }: ToggleProps) => (
	<button
		{...props}
		className={classnames(css.container, props.className)}
		data-state={state ? "1" : "0"}
	/>
);
