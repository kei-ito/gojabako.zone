import { isSafeInteger } from '@nlib/typing';
import type { RecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { rcCell, rcMessageBuffer } from './recoil.app.mts';
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
  rso: RecoilSelectorOpts,
  cellId: DRCellId,
  msg: DRMessage,
) => {
  const { mode } = msg;
  if (isDRDirection(mode)) {
    sendD(rso, cellId, msg, mode);
  } else if (isDRDiagonalDirection(mode)) {
    sendDD(rso, cellId, msg, mode);
  } else {
    spread(rso, cellId, msg);
  }
};

/** @returns {boolean} 転送できればtrueを返します。 */
export const forwardDRMessage = (
  rso: RecoilSelectorOpts,
  cellId: DRCellId,
  msg: DRMessage,
  from: DRDirection,
): boolean => {
  const { mode, ttl } = msg;
  if (isSafeInteger(ttl) && !(0 < ttl)) {
    return false;
  }
  if (isDRDirection(mode)) {
    return sendD(rso, cellId, msg, mode);
  } else if (isDRDiagonalDirection(mode)) {
    return sendDD(rso, cellId, msg, mode);
  } else {
    return spread(rso, cellId, msg, from);
  }
};

const sendD = (
  { get, set }: RecoilSelectorOpts,
  cellId: DRCellId,
  msg: DRMessage,
  d: DRDirection,
): boolean => {
  const adjacentId = getAdjacentId([cellId, d]);
  const adjacentCell = get(rcCell(adjacentId));
  if (adjacentCell) {
    set(rcMessageBuffer(toDRBufferId(cellId, d, 'tx')), (b) => [...b, msg]);
    return true;
  }
  return false;
};

const sendDD = (
  rso: RecoilSelectorOpts,
  cellId: DRCellId,
  msg: DRMessage,
  dd: DRDiagonalDirection,
): boolean => {
  const dx = Math.abs(msg.d[0]);
  const dy = Math.abs(msg.d[1]);
  if (dy < dx) {
    return sendD(rso, cellId, msg, dd[0] as DRDirection);
  } else if (dx < dy) {
    return sendD(rso, cellId, msg, dd[1] as DRDirection);
  } else {
    return sendToIdleBuffer(rso, cellId, msg, dd);
  }
};

const sendToIdleBuffer = (
  { get, set }: RecoilSelectorOpts,
  cellId: DRCellId,
  msg: DRMessage,
  dd: DRDiagonalDirection,
): boolean => {
  const counts: Partial<Record<DRDirection, number>> = {};
  for (const d of dd as Iterable<DRDirection>) {
    if (!(d in counts) && get(rcCell(getAdjacentId([cellId, d])))) {
      counts[d] = get(rcMessageBuffer(toDRBufferId(cellId, d, 'tx'))).length;
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
    set(rcMessageBuffer(toDRBufferId(cellId, min[1], 'tx')), (b) => [
      ...b,
      msg,
    ]);
    counts[min[1]] = min[0] + 1;
    return true;
  }
  return false;
};

const spread = (
  rso: RecoilSelectorOpts,
  cellId: DRCellId,
  msg: DRMessage,
  ...exclude: Array<DRDirection>
): boolean => {
  const directions = new Set(DRDirections);
  for (const d of exclude) {
    directions.delete(d);
  }
  let sent = false;
  for (const d of directions) {
    if (sendD(rso, cellId, msg, d)) {
      sent = true;
    }
  }
  return sent;
};
