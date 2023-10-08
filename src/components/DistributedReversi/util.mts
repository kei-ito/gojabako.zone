import type { Nominal } from '@nlib/typing';
import { createTypeChecker, isNonNegativeSafeInteger } from '@nlib/typing';
import { sign } from '../../util/sign.mts';

export const zoom = { min: 40, max: 200 };
export type DRPlayerId = Nominal<number, 'Owner'>;
export const isDRPlayerId = createTypeChecker<DRPlayerId>(
  'DRPlayerId',
  (input: unknown): input is DRPlayerId => isNonNegativeSafeInteger(input),
);
/** この値は描画用で、実機では使えないことに注意します */
export type DRCellId = Nominal<[number, number], 'DRCellId'>;
export const toDRCellId = (() => {
  const cache = new Map<string, DRCellId>();
  return (x: number, y: number) => {
    const key = `${x},${y}`;
    let cached = cache.get(key);
    if (!cached) {
      cached = [x, y] as DRCellId;
      cache.set(key, cached);
    }
    return cached;
  };
})();
export type DRInitialStateType = Nominal<'N', 'DRState'>;
export const DRInitialState = 'N' as DRInitialStateType;
export type DRCellState = DRInitialStateType | DRPlayerId;
export interface DRSharedProps {
  gameState: DRPlayerId;
  playerCount: number;
}
export interface DRCell {
  state: DRCellState;
  pending: DRPlayerId | null;
  shared: DRSharedProps;
}
export const DRDirections = ['e', 'n', 'w', 's'] as const;
export type DRDirection = (typeof DRDirections)[number];
export const isDRDirection = createTypeChecker<DRDirection>(
  'DRDirection',
  (input: unknown): input is DRDirection =>
    DRDirections.includes(input as DRDirection),
);
export const DRDiagonalDirections = ['ne', 'nw', 'sw', 'se'] as const;
export type DRDiagonalDirection = (typeof DRDiagonalDirections)[number];
export const isDRDiagonalDirection = createTypeChecker<DRDiagonalDirection>(
  'DRDiagonalDirection',
  (input: unknown): input is DRDiagonalDirection =>
    DRDiagonalDirections.includes(input as DRDiagonalDirection),
);
export const DRAdjacentRxDirection: Record<DRDirection, DRDirection> = {
  e: 'w',
  n: 's',
  w: 'e',
  s: 'n',
};
export const DRAdjacentStep: Record<DRDirection, [number, number]> = {
  e: [1, 0],
  n: [0, 1],
  w: [-1, 0],
  s: [0, -1],
};
export const getAdjacentId = (cellId: DRCellId, d: DRDirection): DRCellId => {
  const step = DRAdjacentStep[d];
  return toDRCellId(cellId[0] + step[0], cellId[1] + step[1]);
};
export type DRBufferId = Nominal<[DRCellId, DRDirection], 'DRBufferId'>;
export const toDRBufferId = (() => {
  const cache = new Map<string, DRBufferId>();
  return (cellId: DRCellId, d: DRDirection) => {
    const key = `${cellId[0]},${cellId[1]},${d}`;
    let cached = cache.get(key);
    if (!cached) {
      cached = [cellId, d] as DRBufferId;
      cache.set(key, cached);
    }
    return cached;
  };
})();
interface DRMessageType<T extends string, P> {
  id: string;
  /**
   * このメッセージが移動した距離です。この値はセル間を移動する際（TxからRxに移る際）に変更さ
   * れます。Txバッファに追加しただけでは変更されません。
   */
  d: [number, number];
  type: T;
  ttl?: number;
  mode: DRDiagonalDirection | DRDirection | 'spread';
  payload: P;
}
let deduplicationIdCounter = 0;
export const generateMessageProps = () => ({
  id: (++deduplicationIdCounter).toString(36),
  d: [0, 0] as [number, number],
});
export interface DRMessageMap {
  ping: DRMessageType<'ping', void>;
  press: DRMessageType<'press', DRSharedProps>;
  connect: DRMessageType<'connect', DRSharedProps>;
  setShared: DRMessageType<'setShared', DRSharedProps>;
}
export type DRMessage = DRMessageMap[keyof DRMessageMap];
export const isOpenableDRMessage = ({ mode, d: [dx, dy] }: DRMessage) => {
  switch (mode) {
    case 'e':
      return dy === 0 && 0 < dx;
    case 'w':
      return dy === 0 && dx < 0;
    case 'n':
      return dx === 0 && 0 < dy;
    case 's':
      return dx === 0 && dy < 0;
    case 'ne':
      return dx === dy && 0 < dx;
    case 'nw':
      return dx === -dy && dx < 0;
    case 'se':
      return dx === -dy && 0 < dx;
    case 'sw':
      return dx === dy && dx < 0;
    case 'spread':
    default:
      return true;
  }
};
export const getMessageDirection = (
  d: DRMessage['d'],
): ['c' | 'n' | 's', 'c' | 'e' | 'w'] => [
  sign(d[0], 'n', 'c', 's'),
  sign(d[1], 'w', 'c', 'e'),
];
export const InitialDRPlayerId = 0 as DRPlayerId;
export const nextDRPlayerId = (ownerId: DRPlayerId): DRPlayerId =>
  (ownerId + 1) as DRPlayerId;
export interface DREventLog {
  cellId: DRCellId;
  time: number;
  namespace: string;
  message: string;
}
export interface DREventLogViewOptions {
  time: 'diff' | 'time';
  cellId: DRCellId | null;
  namespace: string | null;
}
