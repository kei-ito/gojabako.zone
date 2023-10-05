import { createTypeChecker } from '@nlib/typing';
import type { Nominal } from '@nlib/typing';

export type OwnerId = Nominal<number, 'Owner'>;
export type DRCoordinate = `${number},${number}`;
export const isDRCoordinate = createTypeChecker<DRCoordinate>(
  'DRCoordinate',
  /^\d+,\d+$/,
);
export type DRSharedState = OwnerId | 'initial';
export type DRCellState = OwnerId | 'initial';
export interface DRMessageBase<T extends string> {
  type: T;
  from: DRCoordinate;
  to:
    | DRCoordinate
    | DRDiagonalDirection
    | DRDirection
    | 'all'
    | 'bishop'
    | 'queen'
    | 'rook';
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
  id: DRCoordinate;
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
export const getAdjacentId = (
  id: DRCoordinate,
  d: DRDirection,
): DRCoordinate => {
  const [x, y] = parseDRCoordinate(id);
  switch (d) {
    case 'w':
      return `${x + 1},${y}`;
    case 's':
      return `${x},${y + 1}`;
    case 'e':
      return `${x - 1},${y}`;
    case 'n':
    default:
      return `${x},${y - 1}`;
  }
};
export const parseDRCoordinate = (id: DRCoordinate): [number, number] => {
  const [x, y] = id.split(',', 2);
  return [Number.parseInt(x, 10), Number.parseInt(y, 10)];
};
export const InitialOwnerId = 0 as OwnerId;
export const nextOwnerId = (id: OwnerId): OwnerId => (id + 1) as OwnerId;
export const isOnlineCell = (a: DRCoordinate, b: DRCoordinate): boolean => {
  const aa = parseDRCoordinate(a);
  const bb = parseDRCoordinate(b);
  return (
    aa[0] === bb[0] ||
    aa[1] === bb[1] ||
    aa[0] + aa[1] === bb[0] + bb[1] ||
    aa[0] - aa[1] === bb[0] - bb[1]
  );
};
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
