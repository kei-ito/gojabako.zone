import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { noop } from '../../util/noop.mts';
import { rcCell } from './recoil.mts';
import type { DRCell, DRCoordinate, DRDirection, DRMessage } from './util.mts';
import {
  InitialOwnerId,
  getMsWithLag,
  isOnlineCell,
  nextOwnerId,
  pickMessage,
} from './util.mts';

export const useRx = (id: DRCoordinate) => {
  const receive = useRecoilCallback(
    ({ set }) =>
      (d: DRDirection, msg: DRMessage, buffer: Array<DRMessage>) => {
        set(rcCell(id), (c) => {
          if (!c) {
            return c;
          }
          const next: DRCell = { ...c, [`rx${d}`]: buffer };
          if (msg.type === 'setShared') {
            if (msg.state === 'initial') {
              if (next.sharedState === 'initial') {
                next.sharedState = InitialOwnerId;
              }
            } else {
              next.sharedState = msg.state;
            }
          } else if (msg.type === 'press') {
            next.sharedState = nextOwnerId(msg.state);
            if (next.state !== msg.state && isOnlineCell(id, msg.at)) {
              next.pending = msg.state;
            }
          }
          return next;
        });
      },
    [id],
  );
  const cell = useRecoilValue(rcCell(id));
  useEffect(() => {
    const tuple = cell && pickMessage(cell, 'rx');
    if (!cell || !tuple) {
      return noop;
    }
    const timerId = setTimeout(() => receive(...tuple), getMsWithLag());
    return () => clearTimeout(timerId);
  }, [cell, id, receive]);
};
