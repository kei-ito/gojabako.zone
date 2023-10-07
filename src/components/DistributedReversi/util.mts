import type { Nominal } from '@nlib/typing';
import { createTypeChecker, isNonNegativeSafeInteger } from '@nlib/typing';
import { sign } from '../../util/sign.mts';

export const zoom = { min: 40, max: 200 };
export type OwnerId = Nominal<number, 'Owner'>;
export const isOwnerId = createTypeChecker<OwnerId>(
  'OwnerId',
  (input: unknown): input is OwnerId => isNonNegativeSafeInteger(input),
);
/** この値は描画用で、実機では使えないことに注意します */
export type DRCellId = `${number},${number}`;
export const isDRCellId = createTypeChecker<DRCellId>('DRCellId', /^\d+,\d+$/);
export type DRInitialStateType = Nominal<'N', 'DRState'>;
export const DRInitialState = 'N' as DRInitialStateType;
export type DRSharedState = DRInitialStateType | OwnerId;
export type DRCellState = DRInitialStateType | OwnerId;
export interface DRCell {
  sharedState: DRSharedState;
  state: DRCellState;
  pending: OwnerId | null;
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
export const parseDRCellId = (cellId: DRCellId): [number, number] => {
  const [x, y] = cellId.split(',', 2);
  return [Number.parseInt(x, 10), Number.parseInt(y, 10)];
};
export const getAdjacentId = (cellId: DRCellId, d: DRDirection): DRCellId => {
  const r = parseDRCellId(cellId);
  const dr = DRAdjacentStep[d];
  return `${r[0] + dr[0]},${r[1] + dr[1]}`;
};
export type DRBufferId = `${DRCellId},${DRDirection}`;
export const parseDRBufferId = (
  bufferId: DRBufferId,
): [DRCellId, DRDirection] => {
  const lastCommaIndex = bufferId.lastIndexOf(',');
  return [
    bufferId.slice(0, lastCommaIndex) as DRCellId,
    bufferId.slice(lastCommaIndex + 1) as DRDirection,
  ];
};
export interface DRMessageBase<T extends string> {
  deduplicationId: string;
  /**
   * このメッセージが移動した距離です。この値はセル間を移動する際（TxからRxに移る際）に変更さ
   * れます。Txバッファに追加しただけでは変更されません。
   */
  d: [number, number];
  type: T;
  ttl?: number;
  mode: DRDiagonalDirection | DRDirection | 'spread';
}
let deduplicationIdCounter = 0;
export const generateMessageProps = () => ({
  deduplicationId: (++deduplicationIdCounter).toString(36),
  d: [0, 0] as [number, number],
});
export interface DRMessagePing extends DRMessageBase<'ping'> {}
export interface DRMessagePress extends DRMessageBase<'press'> {
  state: Exclude<DRCellState, DRInitialStateType>;
}
export interface DRMessageConnect extends DRMessageBase<'connect'> {
  state: DRSharedState;
}
export interface DRMessageSetShared extends DRMessageBase<'setShared'> {
  state: DRSharedState;
}
export interface DRMessageMap {
  ping: DRMessagePing;
  press: DRMessagePress;
  connect: DRMessageConnect;
  setShared: DRMessageSetShared;
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
export const InitialOwnerId = 0 as OwnerId;
export const nextOwnerId = (ownerId: OwnerId): OwnerId =>
  (ownerId + 1) as OwnerId;
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
