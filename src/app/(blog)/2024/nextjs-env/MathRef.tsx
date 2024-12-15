"use client";
import { type HTMLAttributes, useEffect, useState } from "react";

interface MathRefProps extends HTMLAttributes<HTMLElement> {
	refId: string;
}

export const MathRef = ({ refId, ...props }: MathRefProps) => {
	const [div, setDiv] = useState<HTMLElement | null>(null);
	useEffect(() => {
		const target = div?.closest("article")?.querySelector(`#${refId}`);
		if (div && target) {
			while (div.firstChild) {
				div.removeChild(div.firstChild);
			}
			div.append(...target.cloneNode(true).childNodes);
		}
	}, [refId, div]);
	return (
		<div {...props} ref={setDiv}>
			{refId}
		</div>
	);
};
