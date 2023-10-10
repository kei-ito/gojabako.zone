import { isSafeInteger } from '@nlib/typing';
import type { RecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { rcCell, rcTxBuffer } from './recoil.app.mts';
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

export const sendDRMessage = (
  args: RecoilSelectorOpts,
  cellId: DRCellId,
  msg: DRMessage,
) => {
  const { mode } = msg;
  if (isDRDirection(mode)) {
    sendD(args, cellId, msg, mode);
  } else if (isDRDiagonalDirection(mode)) {
    sendDD(args, cellId, msg, mode);
  } else {
    spread(args, cellId, msg);
  }
};

export const forwardDRMessage = (
  args: RecoilSelectorOpts,
  cellId: DRCellId,
  msg: DRMessage,
  from: DRDirection,
) => {
  const { mode, ttl } = msg;
  if (isSafeInteger(ttl) && !(0 < ttl)) {
    return;
  }
  if (isDRDirection(mode)) {
    sendD(args, cellId, msg, mode);
  } else if (isDRDiagonalDirection(mode)) {
    sendDD(args, cellId, msg, mode);
  } else {
    spread(args, cellId, msg, from);
  }
};

const sendD = (
  { get, set }: RecoilSelectorOpts,
  cellId: DRCellId,
  msg: DRMessage,
  d: DRDirection,
) => {
  const adjacentId = getAdjacentId([cellId, d]);
  const adjacentCell = get(rcCell(adjacentId));
  if (adjacentCell) {
    set(rcTxBuffer(toDRBufferId(cellId, d)), (b) => [...b, msg]);
  }
};

const sendDD = (
  args: RecoilSelectorOpts,
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
  { get, set }: RecoilSelectorOpts,
  cellId: DRCellId,
  msg: DRMessage,
  dd: DRDiagonalDirection,
) => {
  const counts: Partial<Record<DRDirection, number>> = {};
  for (const d of dd as Iterable<DRDirection>) {
    if (!(d in counts) && get(rcCell(getAdjacentId([cellId, d])))) {
      counts[d] = get(rcTxBuffer(toDRBufferId(cellId, d))).length;
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
    set(rcTxBuffer(toDRBufferId(cellId, min[1])), (b) => [...b, msg]);
    counts[min[1]] = min[0] + 1;
  }
};

const spread = (
  args: RecoilSelectorOpts,
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
