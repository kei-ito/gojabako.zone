import { useCallback } from 'react';

export const useOnClickLog = <T,>(value: T) =>
  useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      // eslint-disable-next-line no-console
      console.info(value);
      // eslint-disable-next-line no-alert
      alert(JSON.stringify(value));
    },
    [value],
  );
