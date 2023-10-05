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
          set(rcCell(id), (old) => {
            if (!old) {
              return old;
            }
            const c = { ...old };
            if (msg.type === 'setShared') {
              if (msg.state === 'initial') {
                if (c.sharedState === 'initial') {
                  c.sharedState = InitialOwnerId;
                }
              } else {
                c.sharedState = msg.state;
              }
            } else if (msg.type === 'press') {
              c.sharedState = nextOwnerId(msg.state);
              if (c.state !== msg.state && isOnlineCell(id, msg.at)) {
                c.pending = msg.state;
              }
            }
            return c;
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
