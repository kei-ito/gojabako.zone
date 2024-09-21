import { useEffect } from "react";
import { useHash } from "./Hash.mts";

export const hashHitClassName = "hash-hit";

export const useHighlightAndScroll = () => {
  const [hash] = useHash();
  useEffect(() => {
    let target: Element | null = null;
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    if (id) {
      target = document.getElementById(id);
      if (target?.classList.contains("fragment-target")) {
        target = target.parentElement;
      }
      if (target) {
        target.classList.add(hashHitClassName);
        const rect = target.getBoundingClientRect();
        if (
          rect.top < 0 ||
          innerHeight < rect.bottom ||
          rect.left < 0 ||
          innerWidth < rect.right
        ) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }
      }
    }
    return () => target?.classList.remove(hashHitClassName);
  }, [hash]);
};
