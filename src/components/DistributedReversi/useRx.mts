import { isSafeInteger } from '@nlib/typing';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { noop } from '../../util/noop.mts';
import type { RecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { writerFamily } from '../../util/recoil/selector.mts';
import {
  rcCell,
  rcDevMode,
  rcDirectedRxBuffer,
  rcRxDelayMs,
} from './recoil.app.mts';
import { rcForward } from './recoil.send.mts';
import type {
  DRBufferId,
  DRCell,
  DRCellId,
  DRDirection,
  DRMessage,
  DRMessageMap,
} from './util.mts';
import { isOpenableDRMessage, stepDRSharedState } from './util.mts';

export const useRx = (bufferId: DRBufferId) => {
  const receive = useSetRecoilState(rcReceive(bufferId));
  const buffer = useRecoilValue(rcDirectedRxBuffer(bufferId));
  const rxDelayMs = useRecoilValue(rcRxDelayMs);
  const debug = useRecoilValue(rcDevMode);
  const delayMs = debug ? rxDelayMs : 0;
  useEffect(() => {
    if (0 < buffer.length) {
      const timerId = setTimeout(receive, delayMs);
      return () => clearTimeout(timerId);
    }
    return noop;
  }, [buffer, receive, delayMs]);
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
    const [cellId, from] = bufferId;
    const received = getReceived(cellId);
    if (received.has(msg.id)) {
      return;
    }
    received.add(msg.id);
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
  connect: ({ set }, cellId, cell, { payload }) => {
    set(rcCell(cellId), { ...cell, shared: payload });
  },
  press: ({ set }, cellId, cell, { d, payload }) => {
    set(rcCell(cellId), () => {
      const next: DRCell = {
        ...cell,
        shared: stepDRSharedState(payload),
      };
      if (cell.state !== payload.state) {
        const [dx, dy] = d;
        if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
          next.pending = payload.state;
        }
      }
      return next;
    });
  },
  setShared: ({ set }, cellId, cell, { payload }) => {
    set(rcCell(cellId), { ...cell, shared: payload });
  },
};
