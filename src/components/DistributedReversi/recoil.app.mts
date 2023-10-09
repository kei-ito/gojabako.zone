import type { FunctionComponent } from 'react';
import { DefaultValue, atom, atomFamily, selector } from 'recoil';
import { clamp } from '../../util/clamp.mts';
import { isClient } from '../../util/env.mts';
import { writer } from '../../util/recoil/selector.mts';
import { syncSearchParamsNumber } from '../../util/recoil/syncSearchParams.mts';
import type { DRBufferId, DRCell, DRCellId, DRMessage } from './util.mts';
import { DRInitialState, InitialDRPlayerId, zoom } from './util.mts';

export const rcFloaterContent = atom<FunctionComponent | null>({
  key: 'FloaterContent',
  default: null,
});
export const rcSelectedCells = atom<Set<DRCellId>>({
  key: 'SelectedCells',
  default: new Set(),
});
export const rcPointerPosition = atom<[number, number]>({
  key: 'PointerPosition',
  default: [0, 0],
  effects: [
    ({ setSelf }) => {
      const abc = new AbortController();
      if (isClient) {
        addEventListener(
          'pointermove',
          (e) => setSelf([e.clientX, e.clientY]),
          { signal: abc.signal },
        );
      }
      return () => abc.abort();
    },
  ],
});
export const rcDragging = atom<AbortController | null>({
  key: 'Dragging',
  default: null,
});
export const rcTxDelayMs = atom<number>({
  key: 'TxDelayMs',
  default: 300,
  effects: [...syncSearchParamsNumber('txd', 80)],
});
export const rcRxDelayMs = atom<number>({
  key: 'RxDelayMs',
  default: 300,
  effects: [...syncSearchParamsNumber('rxd', 80)],
});
export type XYWHZ =
  | [number, number, number, number, number, [number, number]]
  | [number, number, number, number, number];
export const rcXYWHZ = atom<XYWHZ>({
  key: 'XYZ',
  default: [0, 0, 0, 0, 80],
});

export const rcViewBox = selector<string>({
  key: 'ViewBox',
  get: ({ get }) => {
    const [x, y, w, h, z, d] = get(rcXYWHZ);
    const r = (v: number) => v.toFixed(3);
    if (d) {
      return `${r(x - d[0] / z)} ${r(y - d[1] / z)} ${r(w)} ${r(h)}`;
    }
    return `${r(x)} ${r(y)} ${r(w)} ${r(h)}`;
  },
});

export const rcZoom = selector<{ z: number; cx?: number; cy?: number }>({
  key: 'Zoom',
  get: ({ get }) => ({ z: get(rcXYWHZ)[4] }),
  set: ({ set }, value) => {
    if (value instanceof DefaultValue) {
      return;
    }
    set(rcXYWHZ, ([x, y, w, h, z]) => {
      const newZ = clamp(value.z, zoom.min, zoom.max);
      const rz = newZ / z;
      const newW = w / rz;
      const newH = h / rz;
      const newX = x - (newW - w) * (value.cx ?? 0.5);
      const newY = y - (newH - h) * (value.cy ?? 0.5);
      return [newX, newY, newW, newH, newZ] as XYWHZ;
    });
  },
});

export const rcCell = atomFamily<DRCell | null, DRCellId>({
  key: 'Cell',
  default: null,
});

export const rcDirectedRxBuffer = atomFamily<Array<DRMessage>, DRBufferId>({
  key: 'DirectedRxBuffer',
  default: [],
});

export const rcDirectedTxBuffer = atomFamily<Array<DRMessage>, DRBufferId>({
  key: 'DirectedTxBuffer',
  default: [],
});

export const rcCellList = atom<Set<DRCellId>>({
  key: 'CellList',
  default: new Set(),
});

export const rcInitCell = writer<DRCellId>({
  key: 'InitCell',
  set: ({ set }, cellId) => {
    set(rcCell(cellId), {
      pending: null,
      state: DRInitialState,
      shared: { state: InitialDRPlayerId, playerCount: 2 },
    });
    set(rcCellList, (list) => {
      if (list.has(cellId)) {
        return list;
      }
      return new Set(list).add(cellId);
    });
  },
});

export const rcAddCell = writer<DRCellId>({
  key: 'AddCell',
  set: ({ get, set }, cellId) => {
    const cell = get(rcCell(cellId));
    if (!cell) {
      set(rcInitCell, cellId);
    }
  },
});
