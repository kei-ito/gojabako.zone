import type { PropsWithChildren, ReactNode } from "react";

interface FigureProps {
	id: string;
	type: string;
	caption?: ReactNode;
}

export const Figure = ({
	id,
	type,
	caption,
	children,
}: PropsWithChildren<FigureProps>) => (
	<figure className={caption ? "caption" : undefined} data-type={type}>
		<span id={id} className="fragment-target" />
		<figcaption>
			<span>{caption}</span>
			{/* biome-ignore lint/a11y/useAnchorContent: 他の<figure>と挙動を合わせるため */}
			<a href={`#${id}`} className="fragment-ref" />
		</figcaption>
		{children}
	</figure>
);
