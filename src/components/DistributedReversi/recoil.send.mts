import { isSafeInteger } from '@nlib/typing';
import type { GetRecoilValue, ResetRecoilState, SetRecoilState } from 'recoil';
import { writer, writerFamily } from '../../util/recoil/selector.mts';
import {
  rcCell,
  rcDirectedTxBuffer,
  rcSelectedCoordinates,
} from './recoil.app.mts';
import type {
  DRCellId,
  DRDiagonalDirection,
  DRDirection,
  DRMessage,
} from './util.mts';
import {
  DRDirections,
  getAdjacentId,
  isDRDiagonalDirection,
  isDRDirection,
  toDRBufferId,
} from './util.mts';

interface RecoilSetterArg {
  get: GetRecoilValue;
  set: SetRecoilState;
  reset: ResetRecoilState;
}

export const rcSend = writerFamily<DRMessage, DRCellId>({
  key: 'Send',
  set: (cellId) => (args, msg) => {
    const { mode } = msg;
    if (isDRDirection(mode)) {
      sendD(args, cellId, msg, mode);
    } else if (isDRDiagonalDirection(mode)) {
      sendDD(args, cellId, msg, mode);
    } else {
      spread(args, cellId, msg);
    }
  },
});

interface ForwardProps {
  from: DRDirection;
  msg: DRMessage;
}

export const rcForward = writerFamily<ForwardProps, DRCellId>({
  key: 'Forward',
  set:
    (cellId) =>
    (args, { from, msg }) => {
      const { mode } = msg;
      if (isDRDirection(mode)) {
        sendD(args, cellId, msg, mode);
      } else if (isDRDiagonalDirection(mode)) {
        sendDD(args, cellId, msg, mode);
      } else {
        spread(args, cellId, msg, from);
      }
    },
});

const sendD = (
  { get, set }: RecoilSetterArg,
  cellId: DRCellId,
  msg: DRMessage,
  d: DRDirection,
) => {
  const adjacentId = getAdjacentId([cellId, d]);
  const adjacentCell = get(rcCell(adjacentId));
  if (adjacentCell) {
    set(rcDirectedTxBuffer(toDRBufferId(cellId, d)), (buffer) => [
      ...buffer,
      msg,
    ]);
  }
};

const sendDD = (
  args: RecoilSetterArg,
  cellId: DRCellId,
  msg: DRMessage,
  dd: DRDiagonalDirection,
) => {
  const dx = Math.abs(msg.d[0]);
  const dy = Math.abs(msg.d[1]);
  if (dy < dx) {
    sendD(args, cellId, msg, dd[0] as DRDirection);
  } else if (dx < dy) {
    sendD(args, cellId, msg, dd[1] as DRDirection);
  } else {
    sendToIdleBuffer(args, cellId, msg, dd);
  }
};

const sendToIdleBuffer = (
  { get, set }: RecoilSetterArg,
  cellId: DRCellId,
  msg: DRMessage,
  dd: DRDiagonalDirection,
) => {
  const counts: Partial<Record<DRDirection, number>> = {};
  for (const d of dd as Iterable<DRDirection>) {
    if (!(d in counts) && get(rcCell(getAdjacentId([cellId, d])))) {
      counts[d] = get(rcDirectedTxBuffer(toDRBufferId(cellId, d))).length;
    }
  }
  let min: [number, DRDirection] | null = null;
  for (const d of dd as Iterable<DRDirection>) {
    const count = counts[d];
    if (isSafeInteger(count) && (!min || count < min[0])) {
      min = [count, d];
    }
  }
  if (min) {
    // sendD()でよいですが存在チェックが済んでいるので直接set()します
    set(rcDirectedTxBuffer(toDRBufferId(cellId, min[1])), (buffer) => [
      ...buffer,
      msg,
    ]);
    counts[min[1]] = min[0] + 1;
  }
};

const spread = (
  args: RecoilSetterArg,
  cellId: DRCellId,
  msg: DRMessage,
  ...exclude: Array<DRDirection>
) => {
  const directions = new Set(DRDirections);
  for (const d of exclude) {
    directions.delete(d);
  }
  for (const d of directions) {
    sendD(args, cellId, msg, d);
  }
};

export const rcSendFromSelectedCell = writer<DRMessage>({
  key: 'SendFromSelectedCell',
  set: ({ get, set }, msg) => {
    for (const cellId of get(rcSelectedCoordinates)) {
      const cell = get(rcCell(cellId));
      if (cell) {
        set(rcSend(cellId), msg);
      }
    }
  },
});
