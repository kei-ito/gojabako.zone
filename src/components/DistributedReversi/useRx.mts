import { isSafeInteger } from '@nlib/typing';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { noop } from '../../util/noop.mts';
import type { RecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { writerFamily } from '../../util/recoil/selector.mts';
import { rcCell, rcDirectedRxBuffer, rcRxDelayMs } from './recoil.app.mts';
import { rcForward } from './recoil.send.mts';
import type {
  DRBufferId,
  DRCell,
  DRCellId,
  DRDirection,
  DRMessage,
  DRMessageMap,
} from './util.mts';
import {
  DRInitialState,
  InitialOwnerId,
  isOpenableDRMessage,
  nextOwnerId,
  parseDRBufferId,
} from './util.mts';

export const useRx = (cellId: DRCellId, d: DRDirection) => {
  const receive = useSetRecoilState(rcReceive(`${cellId},${d}`));
  const buffer = useRecoilValue(rcDirectedRxBuffer(`${cellId},${d}`));
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

const getReceived = (() => {
  const cache = new Map<DRCellId, Set<string>>();
  return (cellId: DRCellId) => {
    let cached = cache.get(cellId);
    if (!cached) {
      cached = new Set();
      cache.set(cellId, cached);
    }
    return cached;
  };
})();

const rcReceive = writerFamily<undefined, DRBufferId>({
  key: 'Receive',
  set: (bufferId) => (arg) => {
    const { get, set } = arg;
    const buf = get(rcDirectedRxBuffer(bufferId)).slice();
    const msg = buf.shift();
    set(rcDirectedRxBuffer(bufferId), buf);
    if (!msg) {
      return;
    }
    const [cellId, from] = parseDRBufferId(bufferId);
    const received = getReceived(cellId);
    if (received.has(msg.deduplicationId)) {
      return;
    }
    received.add(msg.deduplicationId);
    const cell = get(rcCell(cellId));
    if (!cell) {
      return;
    }
    if (!isSafeInteger(msg.ttl) || 0 < msg.ttl) {
      /** 転送処理 */
      set(rcForward(cellId), { msg, from });
    }
    if (isOpenableDRMessage(msg)) {
      /** 受信処理 */
      (receivers[msg.type] as Receiver<DRMessage>)(
        arg,
        cellId,
        cell,
        msg,
        from,
      );
    }
  },
});

type Receiver<T extends DRMessage> = (
  arg: RecoilSelectorOpts,
  cellId: DRCellId,
  cell: DRCell,
  msg: T,
  from: DRDirection,
) => void;
type Receivers = {
  [K in keyof DRMessageMap]: Receiver<DRMessageMap[K]>;
};
const receivers: Receivers = {
  ping: noop,
  connect: ({ set }, cellId, cell, msg) => {
    set(rcCell(cellId), () => {
      if (msg.state === DRInitialState) {
        if (cell.sharedState === DRInitialState) {
          return { ...cell, sharedState: InitialOwnerId };
        }
      } else {
        return { ...cell, sharedState: msg.state };
      }
      return cell;
    });
  },
  press: ({ set }, cellId, cell, msg) => {
    set(rcCell(cellId), () => {
      const next = { ...cell, sharedState: nextOwnerId(msg.state) };
      if (cell.state !== msg.state) {
        const [dx, dy] = msg.d;
        if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
          next.pending = msg.state;
        }
      }
      return next;
    });
  },
  setShared: ({ set }, cellId, cell, msg) => {
    set(rcCell(cellId), { ...cell, sharedState: msg.state });
  },
};
