import type { SyntheticEvent } from 'react';
import { useCallback } from 'react';

export const useOnClickFullScreen = (selector: string) =>
  useCallback(
    (event: SyntheticEvent) => {
      const target = (event.currentTarget as Element).closest(selector);
      if (!target) {
        return;
      }
      if (target === document.fullscreenElement) {
        document.exitFullscreen().catch(alert);
      } else {
        target.requestFullscreen().catch(alert);
      }
    },
    [selector],
  );
