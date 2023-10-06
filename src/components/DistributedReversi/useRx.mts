import { useEffect, useMemo } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { noop } from '../../util/noop.mts';
import { rcCell, rcDirectedRxBuffer, rcRxDelayMs } from './recoil.app.mts';
import { rcSend } from './recoil.send.mts';
import type {
  DRCell,
  DRCoordinate,
  DRDirection,
  DRMessage,
  DRMessageMap,
} from './util.mts';
import {
  InitialOwnerId,
  isDRDiagonalDirection,
  isDRDirection,
  nextOwnerId,
} from './util.mts';

type Receiver<T extends DRMessage> = (cell: DRCell, msg: T) => DRCell;
type Receivers = {
  [K in keyof DRMessageMap]: Receiver<DRMessageMap[K]>;
};
const receivers: Receivers = {
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
    const next = { ...cell, sharedState: nextOwnerId(msg.state) };
    if (cell.state !== msg.state) {
      const [dx, dy] = msg.d;
      if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
        next.pending = msg.state;
      }
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
        const cell = snapshot.getLoadable(rcCell(id)).getValue();
        if (!cell) {
          return;
        }
        /** 転送処理 */
        const { mode } = msg;
        if (!isDRDirection(mode) && !isDRDiagonalDirection(mode)) {
          set(rcSend(id), msg);
        }
        /** 受信処理 */
        set(
          rcCell(id),
          (receivers[msg.type] as Receiver<DRMessage>)(cell, msg),
        );
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
