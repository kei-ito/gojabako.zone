import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { noop } from '../../util/noop.mts';
import type { RecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { toRecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { rcCell, rcMessageBuffer, rcRxDelayMs } from './recoil.app.mts';
import { forwardDRMessage, sendDRMessage } from './recoil.send.mts';
import type {
  DRBufferId,
  DRCell,
  DRCellId,
  DRDiagonalDirection,
  DRDirection,
  DRMessage,
  DRMessageMap,
  DRMessageType,
} from './util.mts';
import {
  chessboardDistance,
  generateMessageProps,
  isOpenableDRMessage,
} from './util.mts';

export const useRx = (bufferId: DRBufferId) => {
  const receive = useReceive(bufferId);
  const buffer = useRecoilValue(rcMessageBuffer(bufferId));
  const delayMs = useRecoilValue(rcRxDelayMs);
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
      const rso = toRecoilSelectorOpts(cbi);
      const { set, get } = rso;
      const buf = buffer.slice();
      const msg = buf.shift();
      set(rcMessageBuffer(bufferId), buf);
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
        if (!receiver(rso, cellId, cell, msg, from)) {
          return;
        }
      }
      if (!forwardDRMessage(rso, cellId, msg, from)) {
        const terminator = terminators[msg.type] as
          | Receiver<DRMessage>
          | undefined;
        if (terminator) {
          terminator(rso, cellId, cell, msg, from);
        }
      }
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
const receivers: { [K in DRMessageType]: Receiver<DRMessageMap[K]> } = {
  connect: ({ set }, cellId, cell, { payload }) => {
    set(rcCell(cellId), { ...cell, shared: payload });
    return false;
  },
  reversi1: (rso, cellId, cell, msg) => {
    const { payload } = msg;
    if (cell.state === payload.state) {
      const mode = getAnswerDirection(msg.d);
      if (mode) {
        sendDRMessage(rso, cellId, {
          ...generateMessageProps(),
          type: 'reversi2',
          mode,
          payload: payload.state,
          ttl: chessboardDistance(msg.d),
        });
      }
    } else {
      rso.set(rcCell(cellId), { ...cell, pending: payload.state });
      return true;
    }
    return false;
  },
  reversi2: ({ set }, cellId, cell, msg) => {
    set(rcCell(cellId), {
      ...cell,
      state: msg.payload ?? cell.state,
      pending: null,
    });
    return true;
  },
  setShared: ({ set }, cellId, cell, msg) => {
    set(rcCell(cellId), { ...cell, shared: msg.payload });
    return true;
  },
};

const terminators: { [K in DRMessageType]?: Receiver<DRMessageMap[K]> } = {
  reversi1: (rso, cellId, cell, msg) => {
    const mode = getAnswerDirection(msg.d);
    if (mode) {
      sendDRMessage(rso, cellId, {
        ...generateMessageProps(),
        type: 'reversi2',
        mode,
        payload: null,
        ttl: chessboardDistance(msg.d),
      });
      rso.set(rcCell(cellId), { ...cell, pending: null });
    }
    return false;
  },
};

const getAnswerDirection = ([dx, dy]: [number, number]):
  | DRDiagonalDirection
  | DRDirection
  | null => {
  const v = dy < 0 ? 'n' : 's';
  const h = dx < 0 ? 'e' : 'w';
  if (dx === 0) {
    if (dy === 0) {
      return null;
    }
    return v;
  }
  if (dy === 0) {
    return h;
  }
  return `${v}${h}`;
};
