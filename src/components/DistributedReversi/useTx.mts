import { useEffect, useMemo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { noop } from '../../util/noop.mts';
import {
  rcDirectedTxBuffer,
  rcTransmitMessage,
  rcTxDelayMs,
} from './recoil.mts';
import type { DRCoordinate, DRDirection } from './util.mts';

export const useTx = (id: DRCoordinate, d: DRDirection) => {
  const tx = useMemo(() => rcDirectedTxBuffer(`${id},${d}`), [id, d]);
  const transmit = useSetRecoilState(rcTransmitMessage);
  const buffer = useRecoilValue(tx);
  const txDelayMs = useRecoilValue(rcTxDelayMs);
  useEffect(() => {
    if (0 < buffer.length) {
      const timerId = setTimeout(
        () => transmit({ id, d }),
        txDelayMs * (0.95 + 0.1 * Math.random()),
      );
      return () => clearTimeout(timerId);
    }
    return noop;
  }, [buffer, d, id, transmit, txDelayMs]);
};
