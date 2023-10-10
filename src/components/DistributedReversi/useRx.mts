import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { noop } from '../../util/noop.mts';
import type { RecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { toSelectorOpts } from '../../util/recoil/selector.mts';
import { rcCell, rcDevMode, rcRxBuffer, rcRxDelayMs } from './recoil.app.mts';
import { forwardDRMessage } from './recoil.send.mts';
import type {
  DRBufferId,
  DRCell,
  DRCellId,
  DRDirection,
  DRMessage,
  DRMessageMap,
  DRMessageType,
} from './util.mts';
import { isOpenableDRMessage } from './util.mts';

export const useRx = (bufferId: DRBufferId) => {
  const receive = useReceive(bufferId);
  const buffer = useRecoilValue(rcRxBuffer(bufferId));
  const rxDelayMs = useRecoilValue(rcRxDelayMs);
  const debug = useRecoilValue(rcDevMode);
  const delayMs = debug ? rxDelayMs : 0;
  useEffect(() => {
    if (0 < buffer.length) {
      const timerId = setTimeout(() => receive(buffer), delayMs);
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

const useReceive = (bufferId: DRBufferId) =>
  useRecoilCallback(
    (cbi) => (buffer: Array<DRMessage>) => {
      const arg = toSelectorOpts(cbi);
      const { set, get } = arg;
      const buf = buffer.slice();
      const msg = buf.shift();
      set(rcRxBuffer(bufferId), buf);
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
      if (isOpenableDRMessage(msg)) {
        const receiver = receivers[msg.type] as Receiver<DRMessage>;
        if (!receiver(arg, cellId, cell, msg, from)) {
          return;
        }
      }
      forwardDRMessage(arg, cellId, msg, from);
    },
    [bufferId],
  );

/**
 * @returns {boolean} forwardが必要ならtrueを返します。
 */
type Receiver<T extends DRMessage> = (
  arg: RecoilSelectorOpts,
  cellId: DRCellId,
  cell: DRCell,
  msg: T,
  from: DRDirection,
) => boolean;
type Receivers = {
  [K in DRMessageType]: Receiver<DRMessageMap[K]>;
};
const receivers: Receivers = {
  ping: () => false,
  connect: ({ set }, cellId, cell, { payload }) => {
    set(rcCell(cellId), { ...cell, shared: payload });
    return false;
  },
  reversi1: ({ set }, cellId, cell, msg) => {
    const { payload } = msg;
    if (cell.state === payload.state) {
      /** TODO: Write handler */
    } else {
      set(rcCell(cellId), { ...cell, pending: payload.state });
      return true;
    }
    return false;
  },
  reversi2: () => {
    /** TODO: Write handler */
    return false;
  },
  setShared: ({ set }, cellId, cell, msg) => {
    set(rcCell(cellId), { ...cell, shared: msg.payload });
    return true;
  },
};
