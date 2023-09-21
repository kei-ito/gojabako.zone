'use client';

import { useState, useMemo } from 'react';
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
  const root = useMemo(() => div?.parentElement ?? null, [div]);
  useLineLinkHandlers(root);
  useHighlightCodeLines(root);
  return <div ref={setDiv} style={{ display: 'none' }} />;
};
