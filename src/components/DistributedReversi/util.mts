import { createTypeChecker } from '@nlib/typing';
import type { Nominal } from '@nlib/typing';
import { sign } from '../../util/sign.mts';

export type OwnerId = Nominal<number, 'Owner'>;
/** この値は描画用で、実機では使えないことに注意します */
export type DRCoordinate = `${number},${number}`;
export const isDRCoordinate = createTypeChecker<DRCoordinate>(
  'DRCoordinate',
  /^\d+,\d+$/,
);
export type DRSharedState = OwnerId | 'initial';
export type DRCellState = OwnerId | 'initial';
export interface DRMessageBase<T extends string> {
  type: T;
  /**
   * このメッセージが移動した距離です。この値はセル間を移動する際（TxからRxに移る際）に変更さ
   * れます。Txバッファに追加しただけでは変更されません。
   */
  d: [number, number];
  mode:
    | DRDiagonalDirection
    | DRDirection
    | 'bishop'
    | 'queen'
    | 'rook'
    | 'spread';
}
export interface DRMessagePing extends DRMessageBase<'ping'> {}
export interface DRMessagePress extends DRMessageBase<'press'> {
  state: Exclude<DRCellState, 'initial'>;
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
  n: [0, -1],
  w: [-1, 0],
  s: [0, 1],
};
export const parseDRCoordinate = (id: DRCoordinate): [number, number] => {
  const [x, y] = id.split(',', 2);
  return [Number.parseInt(x, 10), Number.parseInt(y, 10)];
};
export const getAdjacentId = (
  id: DRCoordinate,
  d: DRDirection,
): DRCoordinate => {
  const r = parseDRCoordinate(id);
  const dr = DRAdjacentStep[d];
  return `${r[0] + dr[0]},${r[1] + dr[1]}`;
};
export const getMessageDirection = (
  d: DRMessage['d'],
): ['c' | 'n' | 's', 'c' | 'e' | 'w'] => [
  sign(d[0], 'n', 'c', 's'),
  sign(d[1], 'w', 'c', 'e'),
];
export const InitialOwnerId = 0 as OwnerId;
export const nextOwnerId = (id: OwnerId): OwnerId => (id + 1) as OwnerId;
export interface DREventLog {
  id: DRCoordinate;
  time: number;
  namespace: string;
  message: string;
}
export interface DREventLogViewOptions {
  time: 'diff' | 'time';
  id: DRCoordinate | null;
  namespace: string | null;
}
