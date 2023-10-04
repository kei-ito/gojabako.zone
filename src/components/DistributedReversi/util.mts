import type { Nominal } from '@nlib/typing';

export type OwnerId = Nominal<number, 'Owner'>;
export type DRCoordinate = `${number},${number}`;
export type DRSharedState = OwnerId | 'initial';
export type DRCellState = OwnerId | 'initial';
export type DRMessage =
  | { type: 'ping' }
  | { type: 'press'; at: DRCoordinate; state: Exclude<DRCellState, 'initial'> }
  | { type: 'setShared'; state: DRSharedState };
export interface DRCell {
  id: DRCoordinate;
  sharedState: DRSharedState;
  state: DRCellState;
  pending: OwnerId | null;
  rxt: Array<DRMessage>;
  rxr: Array<DRMessage>;
  rxb: Array<DRMessage>;
  rxl: Array<DRMessage>;
}

export const parseDRCoordinate = (id: DRCoordinate): [number, number] => {
  const [x, y] = id.split(',', 2);
  return [Number.parseInt(x, 10), Number.parseInt(y, 10)];
};

export const listDRAdjacents = function* (
  id: DRCoordinate,
): Generator<DRCoordinate> {
  const [x, y] = parseDRCoordinate(id);
  yield `${x - 1},${y}`;
  yield `${x},${y - 1}`;
  yield `${x + 1},${y}`;
  yield `${x},${y + 1}`;
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
