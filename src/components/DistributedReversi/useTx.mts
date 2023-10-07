import { useEffect, useMemo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { noop } from '../../util/noop.mts';
import { rcDirectedTxBuffer, rcTxDelayMs } from './recoil.app.mts';
import { rcTransmitMessage } from './recoil.transmit.mts';
import type { DRCellId, DRDirection } from './util.mts';

export const useTx = (cellId: DRCellId, d: DRDirection) => {
  const tx = useMemo(() => rcDirectedTxBuffer(`${cellId},${d}`), [cellId, d]);
  const transmit = useSetRecoilState(rcTransmitMessage);
  const buffer = useRecoilValue(tx);
  const txDelayMs = useRecoilValue(rcTxDelayMs);
  useEffect(() => {
    if (0 < buffer.length) {
      const timerId = setTimeout(
        () => transmit({ cellId, d }),
        txDelayMs * (0.95 + 0.1 * Math.random()),
      );
      return () => clearTimeout(timerId);
    }
    return noop;
  }, [buffer, d, cellId, transmit, txDelayMs]);
};
