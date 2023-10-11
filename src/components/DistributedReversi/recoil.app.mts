import type { FunctionComponent } from 'react';
import { DefaultValue, atom, atomFamily, selector } from 'recoil';
import { clamp } from '../../util/clamp.mts';
import { debounce } from '../../util/debounce.mts';
import { getCurrentUrl } from '../../util/getCurrentUrl.mts';
import { onResolve } from '../../util/promise.mts';
import {
  syncSearchParamsBoolean,
  syncSearchParamsNumber,
} from '../../util/recoil/syncSearchParams.mts';
import { encodeCellList } from './cellList.mts';
import type { DRBufferId, DRCell, DRCellId, DRMessage } from './util.mts';
import { toDRCellId, zoom } from './util.mts';

export const rcFloaterContent = atom<FunctionComponent | null>({
  key: 'FloaterContent',
  default: null,
});

export const rcSelectedCoordinates = atom<Set<DRCellId>>({
  key: 'SelectedCoordinates',
  default: new Set(),
});

export const selectCoordinates =
  (cellId: DRCellId, mode: 'add' | 'toggle') => (currentSet: Set<DRCellId>) => {
    const newSet = new Set(currentSet);
    switch (mode) {
      case 'add':
        if (currentSet.has(cellId)) {
          newSet.delete(cellId);
        } else {
          newSet.add(cellId);
        }
        break;
      case 'toggle':
      default:
        newSet.clear();
        if (!currentSet.has(cellId)) {
          newSet.add(cellId);
        }
    }
    return newSet;
  };

export interface CellSelection {
  map: Map<DRCellId, DRCell>;
  maxPlayerCount: number;
}

export const rcSelectedCells = selector<CellSelection>({
  key: 'SelectedCells',
  get: ({ get }) => {
    const map = new Map<DRCellId, DRCell>();
    let maxPlayerCount = 0;
    for (const cellId of get(rcSelectedCoordinates)) {
      const cell = get(rcCell(cellId));
      if (cell) {
        map.set(cellId, cell);
        const { playerCount } = cell.shared;
        if (maxPlayerCount < playerCount) {
          maxPlayerCount = playerCount;
        }
      }
    }
    return { map, maxPlayerCount };
  },
});

export const rcPointerPosition = atom<[number, number] | null>({
  key: 'PointerPosition',
  default: null,
});

export const rcPointeredCell = selector<DRCellId | null>({
  key: 'PointeredCell',
  get: ({ get }) => {
    const pointer = get(rcPointerPosition);
    if (pointer) {
      const [x0, y0, , , z] = get(rcXYWHZ);
      return toDRCellId(pointer[0] / z + x0, -pointer[1] / z - y0);
    }
    return null;
  },
});

export const rcDragging = atom<AbortController | null>({
  key: 'Dragging',
  default: null,
});

const rcDev = atom<boolean>({
  key: 'Dev',
  default: false,
  effects: [...syncSearchParamsBoolean('dev', false)],
});

export const rcDevMode = selector<boolean>({
  key: 'DevMode',
  get: ({ get }) => get(rcDev),
  set: ({ set, reset }, value) => {
    set(rcDev, value);
    reset(rcSelectedCoordinates);
  },
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

export const rcMessageBuffer = atomFamily<Array<DRMessage>, DRBufferId>({
  key: 'MessageBuffer',
  default: [],
});

export const rcCellList = atom<Set<DRCellId>>({
  key: 'CellList',
  default: new Set(),
  effects: [
    ({ onSet, getPromise }) => {
      const key = 'c';
      const sync = debounce((list: Set<DRCellId>) => {
        const url = getCurrentUrl();
        url.searchParams.set(key, encodeCellList(list));
        history.replaceState(null, '', url);
      }, 400);
      onSet(sync);
      onResolve(getPromise(rcCellList), sync);
      return () => sync.abort();
    },
  ],
});
