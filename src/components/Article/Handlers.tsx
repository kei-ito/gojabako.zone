"use client";
import { useMemo, useState } from "react";
import { useHighlightAndScroll } from "../use/HighlightAndScroll.ts";
import {
  useHighlightCodeLines,
  useLineLinkHandlers,
} from "../use/HighlightCode.ts";
import { useInPageLinkHandler } from "../use/InPageLinkHandler.ts";

export const ArticleHandlers = () => {
  useHighlightAndScroll();
  useInPageLinkHandler();
  const [div, setDiv] = useState<Element | null>(null);
  const article = useMemo(() => div?.parentElement ?? null, [div]);
  useLineLinkHandlers(article);
  useHighlightCodeLines(article);
  return <div ref={setDiv} style={{ display: "none" }} />;
};
