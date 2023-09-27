'use client';
import { useMemo, useState } from 'react';
import { useHighlightAndScroll } from '../use/HighlightAndScroll.mts';
import {
  useHighlightCodeLines,
  useLineLinkHandlers,
} from '../use/HighlightCode.mts';
import { useInPageLinkHandler } from '../use/InPageLinkHandler.mts';

export const ArticleHandlers = () => {
  useHighlightAndScroll();
  useInPageLinkHandler();
  const [div, setDiv] = useState<Element | null>(null);
  const article = useMemo(() => div?.parentElement ?? null, [div]);
  useLineLinkHandlers(article);
  useHighlightCodeLines(article);
  return <div ref={setDiv} style={{ display: 'none' }} />;
};
