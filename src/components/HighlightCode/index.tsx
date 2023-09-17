'use client';
import { useEffect, useState } from 'react';
import { useHash } from '../use/Hash.mts';

const targetClassName = 'hljs-target';

export const HighlightCode = () => {
  const [div, setDiv] = useState<Element | null>(null);
  const root = div?.parentElement ?? null;
  const [hash, syncHash] = useHash();
  useEffect(() => {
    const targets = new Set<Element>();
    for (const target of listTargets(root, hash)) {
      target.classList.add(targetClassName);
      targets.add(target);
    }
    return () => {
      for (const target of targets) {
        target.classList.remove(targetClassName);
      }
    };
  }, [root, hash]);
  useEffect(() => {
    const abc = new AbortController();
    if (root) {
      for (const a of root.querySelectorAll<HTMLAnchorElement>('a.hljs-ln')) {
        a.addEventListener(
          'click',
          (event) => {
            event.preventDefault();
            history.replaceState(null, '', getHash(a.href, event.shiftKey));
            syncHash();
          },
          { signal: abc.signal },
        );
      }
    }
    return () => abc.abort();
  }, [root, syncHash]);
  return <div ref={setDiv} style={{ display: 'none' }} />;
};

const listTargets = function* (
  root: Element | null,
  hash: string,
): Generator<Element> {
  if (!root) {
    return;
  }
  let matched = /^#(C\d+)(L[\d-]+)?/.exec(hash);
  if (!matched) {
    return;
  }
  const codeId = matched[1];
  let code = root.querySelector(`.fragment-target#${codeId}`);
  while (code) {
    if (code.tagName.toLowerCase() === 'code') {
      break;
    }
    code = code.nextElementSibling;
  }
  if (!code) {
    return;
  }
  if (!(2 < matched.length)) {
    yield code;
    return;
  }
  matched = /^L(\d+)(?:-(\d+))?/.exec(matched[2]);
  if (!matched) {
    return;
  }
  let start = Number(matched[1]);
  let end = Number(matched[2] || matched[1]);
  if (end < start) {
    [start, end] = [end, start];
  }
  let line = start;
  let target = code.querySelector(`a[href='#${codeId}L${line}']`);
  while (target) {
    if (target.getAttribute('href') === `#${codeId}L${line}`) {
      yield target;
      line += 1;
      if (end < line) {
        break;
      }
    }
    target = target.nextElementSibling;
  }
};

const getHash = (href: string, expand: boolean) => {
  href = new URL(href, location.href).hash;
  if (!expand) {
    if (location.hash === href) {
      const reset = new URL(location.href);
      reset.hash = '';
      return reset.href;
    }
    return href;
  }
  const matched = /(#C\d+)L(\d+)(?:-(\d+))?/.exec(location.hash);
  if (!matched || !href.startsWith(matched[1])) {
    return href;
  }
  const focus = Number(href.slice(matched[1].length + 1));
  const current = toRange(Number(matched[2]), Number(matched[3] || matched[2]));
  const { start, end } = toRange(focus, current.start, current.end);
  if (start === end) {
    return href;
  }
  return `${matched[1]}L${start}-${end}`;
};

const toRange = (...list: Array<number>) => {
  let start = Infinity;
  let end = -Infinity;
  for (const item of list) {
    if (item < start) {
      start = item;
    }
    if (end < item) {
      end = item;
    }
  }
  return { start, end };
};
