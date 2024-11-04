import type { HTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { classnames } from "../../util/classnames";

interface FigureProps extends HTMLAttributes<HTMLElement> {
	id: string;
	type: string;
	caption?: ReactNode;
}

export const Figure = ({
	id,
	type,
	caption,
	children,
	...props
}: PropsWithChildren<FigureProps>) => (
	<figure
		{...props}
		id={id}
		className={classnames(caption ? "caption" : undefined, props.className)}
		data-type={type}
	>
		<figcaption>
			<span>{caption}</span>
			<a href={`#${id}`} className="fragment-ref">
				#{id}
			</a>
		</figcaption>
		{children}
	</figure>
);
