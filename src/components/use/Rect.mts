/* eslint-disable func-style */
import { useEffect, useState } from 'react';
import { noop } from '../../util/noop.mts';

export function useRect(element: Element): DOMRect;
export function useRect(element?: Element | null): DOMRect | null;
export function useRect(element: Element | null | undefined) {
  const [rect, setRect] = useState<DOMRect | null>(
    element ? element.getBoundingClientRect() : null,
  );
  useEffect(() => {
    if (!element) {
      return noop;
    }
    let frameId = requestAnimationFrame(noop);
    const sync = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        setRect(element.getBoundingClientRect());
      });
    };
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element]);
  return rect;
}
