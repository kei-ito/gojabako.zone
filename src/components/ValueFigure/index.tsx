import type { ReactNode } from "react";
import { DataViewer } from "../DataViewer";

interface ValueFigureProps {
	id: string;
	caption?: ReactNode;
	style: object;
}

export const ValueFigure = ({ id, caption, style }: ValueFigureProps) => (
	<figure className={caption ? "caption" : undefined}>
		<span id={id} className="fragment-target" />
		<figcaption>
			<span>{caption}</span>
			{/* biome-ignore lint/a11y/useAnchorContent: 他の<figure>と挙動を合わせるため */}
			<a href={`#${id}`} className="fragment-ref" />
		</figcaption>
		<DataViewer value={style} />
	</figure>
);
