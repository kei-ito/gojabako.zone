import type { HTMLAttributes } from "react";
import { classnames } from "../../util/classnames";
import { walkValue } from "../../util/walkValue";
import * as css from "./style.module.css";

export interface DataViewerProps<T = unknown>
	extends HTMLAttributes<HTMLElement> {
	value: T;
}

export const DataViewer = <T,>({ value, ...props }: DataViewerProps<T>) => (
	<div {...props} className={classnames(css.container, props.className)}>
		{[
			...(function* () {
				for (const { text, type, path } of walkValue(value)) {
					const fullPath = `.${path.join(".")}`;
					const depth = path.length;
					let label = "";
					if (0 < depth) {
						label += "  ".repeat(depth);
						label += `${path[path.length - 1]}: `;
					}
					yield (
						<dl key={fullPath}>
							{label && <dt title={fullPath}>{label}</dt>}
							<dd title={type}>{text}</dd>
						</dl>
					);
				}
			})(),
		]}
	</div>
);
