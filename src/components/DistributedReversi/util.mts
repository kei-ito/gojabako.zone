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
  to: DRCoordinate;
}
export interface DRMessagePing extends DRMessageBase<'ping'> {}
export interface DRMessagePress extends DRMessageBase<'press'> {
  at: DRCoordinate;
  state: Exclude<DRCellState, 'initial'>;
}
export interface DRMessageSetShared extends DRMessageBase<'setShared'> {
  state: DRSharedState;
}
export type DRMessage = DRMessagePing | DRMessagePress | DRMessageSetShared;

export interface DRCell {
  id: DRCoordinate;
  sharedState: DRSharedState;
  state: DRCellState;
  pending: OwnerId | null;
}
export type DRDirection = 'b' | 'l' | 'r' | 't';
export const getAdjacentId = (
  id: DRCoordinate,
  d: DRDirection,
): DRCoordinate => {
  const [x, y] = parseDRCoordinate(id);
  switch (d) {
    case 'r':
      return `${x + 1},${y}`;
    case 'b':
      return `${x},${y + 1}`;
    case 'l':
      return `${x - 1},${y}`;
    case 't':
    default:
      return `${x},${y - 1}`;
  }
};
export const DRDirections = ['l', 't', 'r', 'b'] as const;
export const allRxAndCoordinates = function* (id: DRCoordinate) {
  const [x, y] = parseDRCoordinate(id);
  yield ['rxl', `${x - 1},${y}`] as const;
  yield ['rxt', `${x},${y + 1}`] as const;
  yield ['rxr', `${x + 1},${y}`] as const;
  yield ['rxb', `${x},${y - 1}`] as const;
};
export const allTxAndCoordinates = function* (id: DRCoordinate) {
  const [x, y] = parseDRCoordinate(id);
  yield ['txl', `${x - 1},${y}`] as const;
  yield ['txt', `${x},${y + 1}`] as const;
  yield ['txr', `${x + 1},${y}`] as const;
  yield ['txb', `${x},${y - 1}`] as const;
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
