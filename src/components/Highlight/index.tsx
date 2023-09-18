'use client';
import { useEffect } from 'react';
import { useHash } from '../use/Hash.mts';

const targetClassName = 'hash-hit';

export const Highlight = () => {
  const [hash] = useHash();
  useEffect(() => {
    let target: Element | null = null;
    const id = decodeURIComponent(hash.replace(/^#/, ''));
    if (id) {
      target = document.getElementById(id);
      if (target?.classList.contains('fragment-target')) {
        target = target.parentElement;
      }
      if (target) {
        target.classList.add(targetClassName);
      }
    }
    return () => {
      if (target) {
        target.classList.remove(targetClassName);
      }
    };
  }, [hash]);
  return null;
};
