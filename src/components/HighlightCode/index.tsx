'use client';
import { useEffect, useMemo, useState } from 'react';
import { minmax } from '../../util/minmax.mts';
import { noop } from '../../util/noop.mts';
import {
  listValues,
  normalizeRanges,
  parseRangeListString,
  toRangeListString,
} from '../../util/range.mts';
import { useHash } from '../use/Hash.mts';

const targetClassName = 'hash-hit';

export const HighlightCode = () => {
  const [div, setDiv] = useState<Element | null>(null);
  const root = useMemo(() => div?.parentElement ?? null, [div]);
  useClickHandlers(root);
  useHighlight(root);
  return <div ref={setDiv} style={{ display: 'none' }} />;
};

const useClickHandlers = (root: Element | null) => {
  const [, syncHash] = useHash();
  useEffect(() => {
    let timerId = setTimeout(noop);
    let abc = new AbortController();
    const set = () => {
      if (!root) {
        return;
      }
      const onClick = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const a = event.currentTarget as HTMLAnchorElement;
        syncHash(
          calculateHash(a.href, {
            add: event.metaKey || event.ctrlKey,
            expand: event.shiftKey,
          }),
        );
      };
      for (const a of root.querySelectorAll<HTMLAnchorElement>('a.hljs-ln')) {
        a.addEventListener('click', onClick, { signal: abc.signal });
      }
    };
    const reset = () => {
      clearTimeout(timerId);
      abc.abort();
      abc = new AbortController();
    };
    const onMutation = () => {
      reset();
      timerId = setTimeout(set, 300);
    };
    const observer = new MutationObserver(onMutation);
    if (root) {
      observer.observe(root, { childList: true });
      onMutation();
    }
    return () => {
      reset();
      observer.disconnect();
    };
  }, [root, syncHash]);
};

const useHighlight = (root: Element | null) => {
  const [hash] = useHash();
  const [codeId, lineId] = useMemo(() => parseHash(hash), [hash]);
  const code = useMemo(() => {
    let element = codeId && root ? root.querySelector(`#${codeId}`) : null;
    while (element && element.tagName.toLowerCase() !== 'code') {
      element = element.nextElementSibling;
    }
    return element;
  }, [root, codeId]);
  const normalizedRanges = useMemo(
    () => [...normalizeRanges(parseRangeListString(lineId))],
    [lineId],
  );
  useEffect(() => {
    const targets = new Set<Element>();
    if (codeId && code) {
      const expected = toRangeListString(normalizedRanges);
      if (lineId === expected) {
        let line = code.firstElementChild;
        for (const i of listValues(normalizedRanges)) {
          const href = `#${codeId}L${i}`;
          while (line && line.getAttribute('href') !== href) {
            line = line.nextElementSibling;
          }
          if (!line) {
            break;
          }
          line.classList.add(targetClassName);
          targets.add(line);
        }
      } else {
        history.replaceState(null, '', `#${codeId}L${expected}`);
      }
    }
    return () => {
      for (const line of targets) {
        line.classList.remove(targetClassName);
      }
    };
  }, [codeId, lineId, code, normalizedRanges]);
};

const parseHash = (hash: string) => {
  const matched = /^#(.*?)(?:L(.*))?$/.exec(hash) ?? [];
  return [matched[1] || '', matched[2] || ''];
};

const calculateHash = (
  requestedHref: string,
  mode: { add: boolean; expand: boolean },
) => {
  const [requestedCodeId, requestedLineId] = parseHash(
    new URL(requestedHref, location.href).hash,
  );
  const [currentCodeId, currentLineId] = parseHash(location.hash);
  if (requestedCodeId !== currentCodeId) {
    return requestedHref;
  }
  if (requestedLineId === currentLineId) {
    const reset = new URL(location.href);
    reset.hash = '';
    return reset.href;
  }
  let ranges = [...parseRangeListString(requestedLineId)];
  if (mode.expand) {
    ranges = [
      minmax(
        (function* (): Generator<number> {
          for (const item of [ranges, parseRangeListString(currentLineId)]) {
            for (const [a, b] of item) {
              yield a;
              yield b;
            }
          }
        })(),
      ),
    ];
  } else if (mode.add) {
    const current = [...parseRangeListString(currentLineId)];
    ranges = [...normalizeRanges([...ranges, ...current])];
  }
  return `#${requestedCodeId}L${toRangeListString(ranges)}`;
};
