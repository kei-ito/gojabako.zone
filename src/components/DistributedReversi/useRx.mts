import { useEffect } from 'react';
import type { CallbackInterface } from 'recoil';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { noop } from '../../util/noop.mts';
import { rcCell, rcMessageBuffer, rcRxDelayMs } from './recoil.mts';
import type {
  DRCell,
  DRCoordinate,
  DRDirection,
  DRMessage,
  DRMessageMap,
} from './util.mts';
import {
  InitialOwnerId,
  getAdjacentId,
  isOnlineCell,
  nextOwnerId,
  parseDRCoordinate,
} from './util.mts';

type Handler<T extends DRMessage> = (
  cell: DRCell,
  msg: T,
  iface: CallbackInterface,
) => DRCell;
type Handlers = {
  [K in keyof DRMessageMap]: Handler<DRMessageMap[K]>;
};

const handlers: Handlers = {
  ping: (cell) => cell,
  setShared: (cell, msg) => {
    if (msg.state === 'initial') {
      if (cell.sharedState === 'initial') {
        return { ...cell, sharedState: InitialOwnerId };
      }
    } else {
      return { ...cell, sharedState: msg.state };
    }
    return cell;
  },
  press: (cell, msg, { set }) => {
    const from = cell.id;
    const next = { ...cell, sharedState: nextOwnerId(msg.state) };
    if (cell.state !== msg.state && isOnlineCell(from, msg.at)) {
      next.pending = msg.state;
    }
    const r0 = parseDRCoordinate(msg.at);
    const r1 = parseDRCoordinate(from);
    const dy = r1[1] - r0[1];
    const vertical: Array<DRDirection> = [];
    if (dy === 0) {
      const d = r1[0] - r0[0] < 0 ? 'l' : 'r';
      const to = getAdjacentId(from, d);
      set(rcMessageBuffer(`${from},tx${d}`), (buffer) => [
        ...buffer,
        { ...msg, from, to },
      ]);
      vertical.push('t', 'b');
    } else {
      vertical.push(dy < 0 ? 't' : 'b');
    }
    for (const d of vertical) {
      const to = getAdjacentId(from, d);
      set(rcMessageBuffer(`${from},tx${d}`), (buffer) => [
        ...buffer,
        { ...msg, from, to },
      ]);
    }
    return next;
  },
};

export const useRx = (id: DRCoordinate, d: DRDirection) => {
  const receive = useRecoilCallback(
    (iface) => () => {
      const { snapshot, set } = iface;
      const buf = snapshot
        .getLoadable(rcMessageBuffer(`${id},rx${d}`))
        .getValue()
        .slice();
      const msg = buf.shift();
      set(rcMessageBuffer(`${id},rx${d}`), buf);
      if (!msg) {
        return;
      }
      set(rcCell(id), (cell) => {
        if (!cell) {
          return cell;
        }
        if (id !== msg.to) {
          set(rcMessageBuffer(`${id},tx${getHopD(id, msg.to)}`), (buffer) => [
            ...buffer,
            msg,
          ]);
          return cell;
        }
        return (handlers[msg.type] as Handler<DRMessage>)(cell, msg, iface);
      });
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

const getHopD = (from: DRCoordinate, to: DRCoordinate): DRDirection => {
  const r1 = parseDRCoordinate(to);
  const r0 = parseDRCoordinate(from);
  const dy = r1[1] - r0[1];
  if (dy === 0) {
    return r1[0] - r0[0] < 0 ? 'l' : 'r';
  }
  return dy < 0 ? 't' : 'b';
};
