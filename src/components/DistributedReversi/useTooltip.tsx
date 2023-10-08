import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { DataView } from '../DataView';
import { rcTooltip } from './recoil.app.mts';

export const useTooltip = (message: ReactNode, data?: unknown) => {
  const setTooltip = useSetRecoilState(rcTooltip);
  const onPointerLeave = useResetRecoilState(rcTooltip);
  const onPointerEnter = useCallback(() => {
    setTooltip(
      data ? (
        <>
          <div>{message}</div>
          <DataView value={data} />
        </>
      ) : (
        <div>{message}</div>
      ),
    );
  }, [setTooltip, data, message]);
  return { onPointerEnter, onPointerLeave };
};
