import { useEffect, useState } from "react";
import { noop } from "../../util/noop.mts";

export const useElement = (
  selector: string,
  parent: Document | Element | null = document.body,
): HTMLElement | null => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!parent) {
      return noop;
    }
    const onMutation = () => {
      let found = parent.querySelector<HTMLElement>(selector);
      setElement(found);
      found = found?.parentElement ?? null;
      if (found) {
        mObserver.observe(found, { childList: true });
      }
    };
    const mObserver = new MutationObserver(onMutation);
    onMutation();
    return () => mObserver.disconnect();
  }, [selector, parent]);
  return element;
};
