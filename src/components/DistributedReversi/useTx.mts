import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { noop } from '../../util/noop.mts';
import { rcCell, rcMessageBuffer, rcTxDelayMs } from './recoil.mts';
import type { DRCoordinate, DRDirection } from './util.mts';
import { getAdjacentId } from './util.mts';

export const useTx = (id: DRCoordinate, d: DRDirection) => {
  const send = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const adjacentId = getAdjacentId(id, d);
        const buf = snapshot
          .getLoadable(rcMessageBuffer(`${id},tx${d}`))
          .getValue()
          .slice();
        const msg = buf.shift();
        set(rcMessageBuffer(`${id},tx${d}`), buf);
        if (msg) {
          const adjacentCell = snapshot
            .getLoadable(rcCell(adjacentId))
            .getValue();
          if (adjacentCell) {
            const dd = getAdjacentDirection(d);
            set(rcMessageBuffer(`${adjacentId},rx${dd}`), (rx) => [...rx, msg]);
          }
        }
      },
    [id, d],
  );
  const buffer = useRecoilValue(rcMessageBuffer(`${id},tx${d}`));
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
    case 'r':
      return 'l';
    case 'b':
      return 't';
    case 'l':
      return 'r';
    case 't':
    default:
      return 'b';
  }
};
