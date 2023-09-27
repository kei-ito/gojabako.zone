export type DRCoordinate = `${number},${number}`;

export type DRSharedState = number | 'initial';

export type DRCellState = number | 'initial';

export type DRMessage =
  | { type: 'setShared'; state: DRSharedState }
  | { type: 'test'; state: DRCellState };

export interface DRCell {
  sharedState: DRSharedState;
  state: DRCellState;
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
