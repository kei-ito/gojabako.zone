import type { Nominal } from '@nlib/typing';

export type OwnerId = Nominal<number, 'Owner'>;
export type DRCoordinate = `${number},${number}`;
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
  rxt: Array<DRMessage>;
  rxr: Array<DRMessage>;
  rxb: Array<DRMessage>;
  rxl: Array<DRMessage>;
  txt: Array<DRMessage>;
  txr: Array<DRMessage>;
  txb: Array<DRMessage>;
  txl: Array<DRMessage>;
}
export type DRDirection = 'b' | 'l' | 'r' | 't';
export const getAdjecentId = (
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
export const getMsWithLag = () => 150 + 50 * Math.random();
export const pickMessage = (
  cell: DRCell,
  type: 'rx' | 'tx',
): [DRDirection, DRMessage, Array<DRMessage>] | null => {
  let longest: [DRDirection, Array<DRMessage>] | null = null;
  for (const d of DRDirections) {
    const buffer = cell[`${type}${d}`];
    if (!longest || longest[1].length < buffer.length) {
      longest = [d, buffer];
    }
  }
  if (longest) {
    const [d, [msg, ...buffer]] = longest;
    return [d, msg, buffer];
  }
  return null;
};
