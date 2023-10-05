import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { noop } from '../../util/noop.mts';
import { rcCell, rcMessageBuffer, rcRxDelayMs } from './recoil.mts';
import type { DRCoordinate, DRDirection } from './util.mts';
import { InitialOwnerId, isOnlineCell, nextOwnerId } from './util.mts';

export const useRx = (id: DRCoordinate, d: DRDirection) => {
  const receive = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const buf = snapshot
          .getLoadable(rcMessageBuffer(`${id},rx${d}`))
          .getValue()
          .slice();
        const msg = buf.shift();
        set(rcMessageBuffer(`${id},rx${d}`), buf);
        if (msg) {
          set(rcCell(id), (oldCell) => {
            if (!oldCell) {
              return oldCell;
            }
            const cell = { ...oldCell };
            if (msg.type === 'setShared') {
              if (msg.state === 'initial') {
                if (cell.sharedState === 'initial') {
                  cell.sharedState = InitialOwnerId;
                }
              } else {
                cell.sharedState = msg.state;
              }
            } else if (msg.type === 'press') {
              cell.sharedState = nextOwnerId(msg.state);
              if (cell.state !== msg.state && isOnlineCell(id, msg.at)) {
                cell.pending = msg.state;
              }
            }
            return cell;
          });
        }
      },
    [d, id],
  );
  const buffer = useRecoilValue(rcMessageBuffer(`${id},rx${d}`));
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
