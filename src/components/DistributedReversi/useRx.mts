import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { noop } from '../../util/noop.mts';
import { rcDirectedRxBuffer, rcRxDelayMs } from './recoil.app.mts';
import { rcReceive } from './recoil.receive.mts';
import type { DRCellId, DRDirection } from './util.mts';

export const useRx = (cellId: DRCellId, d: DRDirection) => {
  const receive = useSetRecoilState(rcReceive(`${cellId},${d}`));
  const buffer = useRecoilValue(rcDirectedRxBuffer(`${cellId},${d}`));
  const rxDelayMs = useRecoilValue(rcRxDelayMs);
  useEffect(() => {
    if (0 < buffer.length) {
      const timerId = setTimeout(
        receive,
        rxDelayMs * (0.95 + 0.1 * Math.random()),
      );
      return () => clearTimeout(timerId);
    }
    return noop;
  }, [buffer, receive, rxDelayMs]);
};
