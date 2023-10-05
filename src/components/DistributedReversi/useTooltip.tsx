import type { ReactNode } from 'react';
import { useRecoilCallback } from 'recoil';
import { DataView } from '../DataView';
import { rcTooltip } from './recoil.mts';

export const useTooltip = (message: ReactNode, data?: unknown) => {
  const onPointerEnter = useRecoilCallback(
    ({ set }) =>
      () => {
        set(
          rcTooltip,
          data ? (
            <>
              <div>{message}</div>
              <DataView value={data} />
            </>
          ) : (
            <div>{message}</div>
          ),
        );
      },
    [message, data],
  );
  const onPointerLeave = useRecoilCallback(
    ({ reset }) =>
      () => {
        reset(rcTooltip);
      },
    [],
  );
  return { onPointerEnter, onPointerLeave };
};
