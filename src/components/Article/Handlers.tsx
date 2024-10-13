"use client";
import { useMemo, useState } from "react";
import {
	useHighlightCodeLines,
	useLineLinkHandlers,
} from "../use/HighlightCode";
import { useInPageLinkHandler } from "../use/InPageLinkHandler.ts";

export const ArticleHandlers = () => {
	useInPageLinkHandler();
	const [div, setDiv] = useState<Element | null>(null);
	const article = useMemo(() => div?.parentElement ?? null, [div]);
	useLineLinkHandlers(article);
	useHighlightCodeLines(article);
	return (
		<>
			<div ref={setDiv} style={{ display: "none" }} />
		</>
	);
};
