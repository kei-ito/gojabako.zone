import { useCallback } from 'react';

export const useOnClickLog = <T,>(value: T) =>
  useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      console.info(value);
      alert(JSON.stringify(value));
    },
    [value],
  );
