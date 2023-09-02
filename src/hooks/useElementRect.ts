import { useEffect, useState } from 'react';

export const useElementRect = (
  element?: Element | null,
  initialRect?: DOMRectReadOnly,
) => {
  const [rect, setRect] = useState(initialRect || null);
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setRect(entry.contentRect);
      }
    });
    if (element) {
      observer.observe(element);
    }
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [element]);
  return rect;
};
