import { useEffect } from "react";
import { getCurrentUrl } from "../../util/getCurrentUrl.mts";
import { useHash } from "./Hash.mts";

export const useInPageLinkHandler = () => {
  const [, syncHash] = useHash();
  useEffect(() => {
    const abc = new AbortController();
    addEventListener(
      "click",
      (event) => {
        const a = (event.target as Element | undefined)?.closest("a");
        if (!a) {
          return;
        }
        const currentPageUrl = getCurrentUrl();
        currentPageUrl.hash = "";
        const hrefUrl = new URL(a.href, currentPageUrl);
        if (hrefUrl.href.startsWith(currentPageUrl.href)) {
          event.preventDefault();
          syncHash(hrefUrl.hash);
        }
      },
      { signal: abc.signal, passive: false },
    );
    return () => abc.abort();
  }, [syncHash]);
};
