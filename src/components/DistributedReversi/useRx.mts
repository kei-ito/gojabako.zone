import { useEffect, useMemo } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { noop } from '../../util/noop.mts';
import { rcCell, rcDirectedRxBuffer, rcRxDelayMs, rcSend } from './recoil.mts';
import type {
  DRCell,
  DRCoordinate,
  DRDirection,
  DRMessage,
  DRMessageMap,
} from './util.mts';
import { InitialOwnerId, isOnlineCell, nextOwnerId } from './util.mts';

type Handler<T extends DRMessage> = (cell: DRCell, msg: T) => DRCell;
type Handlers = {
  [K in keyof DRMessageMap]: Handler<DRMessageMap[K]>;
};

const handlers: Handlers = {
  ping: (cell) => cell,
  connect: (cell, msg) => {
    if (msg.state === 'initial') {
      if (cell.sharedState === 'initial') {
        return { ...cell, sharedState: InitialOwnerId };
      }
    } else {
      return { ...cell, sharedState: msg.state };
    }
    return cell;
  },
  press: (cell, msg) => {
    const from = cell.id;
    const next = { ...cell, sharedState: nextOwnerId(msg.state) };
    if (cell.state !== msg.state && isOnlineCell(from, msg.from)) {
      next.pending = msg.state;
    }
    return next;
  },
  setShared: (cell, msg) => ({ ...cell, sharedState: msg.state }),
};

export const useRx = (id: DRCoordinate, d: DRDirection) => {
  const rx = useMemo(() => rcDirectedRxBuffer(`${id},${d}`), [id, d]);
  const receive = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const buf = snapshot.getLoadable(rx).getValue().slice();
        const msg = buf.shift();
        set(rx, buf);
        if (!msg) {
          return;
        }
        set(rcCell(id), (cell) => {
          if (!cell) {
            return cell;
          }
          /** TODO: ここの条件を修正（nsew,allに対応する） */
          if (id !== msg.to) {
            set(rcSend(id), msg);
            return cell;
          }
          return (handlers[msg.type] as Handler<DRMessage>)(cell, msg);
        });
      },
    [id, rx],
  );
  const buffer = useRecoilValue(rx);
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
