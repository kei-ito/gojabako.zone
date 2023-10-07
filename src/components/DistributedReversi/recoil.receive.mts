import { isSafeInteger } from '@nlib/typing';
import { writerFamily } from '../../util/recoil/selector.mts';
import { rcCell, rcDirectedRxBuffer } from './recoil.app.mts';
import { rcForward } from './recoil.send.mts';
import type { DRBufferId, DRCell, DRMessage, DRMessageMap } from './util.mts';
import {
  DRInitialState,
  InitialOwnerId,
  isOpenableDRMessage,
  nextOwnerId,
  parseDRBufferId,
} from './util.mts';

const getReceived = (() => {
  const cache = new Map<DRBufferId, Set<string>>();
  return (bufferId: DRBufferId) => {
    let cached = cache.get(bufferId);
    if (!cached) {
      cached = new Set();
      cache.set(bufferId, cached);
    }
    return cached;
  };
})();

export const rcReceive = writerFamily<undefined, DRBufferId>({
  key: 'Receive',
  set:
    (bufferId) =>
    ({ get, set }) => {
      const buf = get(rcDirectedRxBuffer(bufferId)).slice();
      const msg = buf.shift();
      set(rcDirectedRxBuffer(bufferId), buf);
      const received = getReceived(bufferId);
      if (!msg || received.has(msg.deduplicationId)) {
        return;
      }
      received.add(msg.deduplicationId);
      const [cellId, from] = parseDRBufferId(bufferId);
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
        set(
          rcCell(cellId),
          (receivers[msg.type] as Receiver<DRMessage>)(cell, msg),
        );
      }
    },
});

type Receiver<T extends DRMessage> = (cell: DRCell, msg: T) => DRCell;
type Receivers = {
  [K in keyof DRMessageMap]: Receiver<DRMessageMap[K]>;
};
const receivers: Receivers = {
  ping: (cell) => cell,
  connect: (cell, msg) => {
    if (msg.state === DRInitialState) {
      if (cell.sharedState === DRInitialState) {
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
