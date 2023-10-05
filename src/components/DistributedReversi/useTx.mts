import { useEffect, useMemo } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { noop } from '../../util/noop.mts';
import {
  rcCell,
  rcDirectedTxBuffer,
  rcReceive,
  rcTxDelayMs,
} from './recoil.mts';
import type { DRCoordinate, DRDirection } from './util.mts';
import { getAdjacentId } from './util.mts';

export const useTx = (id: DRCoordinate, d: DRDirection) => {
  const tx = useMemo(() => rcDirectedTxBuffer(`${id},${d}`), [id, d]);
  const send = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const adjacentId = getAdjacentId(id, d);
        const buf = snapshot.getLoadable(tx).getValue().slice();
        const msg = buf.shift();
        set(tx, buf);
        if (msg) {
          const adjacentCell = snapshot
            .getLoadable(rcCell(adjacentId))
            .getValue();
          if (adjacentCell) {
            const dd = getAdjacentDirection(d);
            set(rcReceive(`${adjacentId},${dd}`), msg);
          }
        }
      },
    [id, d, tx],
  );
  const buffer = useRecoilValue(tx);
  const txDelayMs = useRecoilValue(rcTxDelayMs);
  useEffect(() => {
    if (0 < buffer.length) {
      const timerId = setTimeout(
        send,
        txDelayMs * (0.95 + 0.1 * Math.random()),
      );
      return () => clearTimeout(timerId);
    }
    return noop;
  }, [buffer, send, txDelayMs]);
};

const getAdjacentDirection = (d: DRDirection): DRDirection => {
  switch (d) {
    case 'w':
      return 'e';
    case 'e':
      return 'w';
    case 'n':
      return 's';
    case 's':
    default:
      return 'n';
  }
};
