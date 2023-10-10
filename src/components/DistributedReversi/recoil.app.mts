import type { FunctionComponent } from 'react';
import {
  DefaultValue,
  atom,
  atomFamily,
  selector,
  selectorFamily,
} from 'recoil';
import { clamp } from '../../util/clamp.mts';
import { writer, writerFamily } from '../../util/recoil/selector.mts';
import {
  syncSearchParamsBoolean,
  syncSearchParamsNumber,
} from '../../util/recoil/syncSearchParams.mts';
import type {
  DRBufferId,
  DRCell,
  DRCellId,
  DRCellState,
  DRMessage,
  DRPlayerId,
} from './util.mts';
import {
  DRInitialState,
  InitialDRPlayerId,
  toDRCellId,
  zoom,
} from './util.mts';

export const rcFloaterContent = atom<FunctionComponent | null>({
  key: 'FloaterContent',
  default: null,
});

export const rcSelectedCoordinates = atom<Set<DRCellId>>({
  key: 'SelectedCoordinates',
  default: new Set(),
});

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

export const rcSelectCell = writer<{
  cellId: DRCellId;
  mode: 'add' | 'toggle';
}>({
  key: 'SelectCell',
  set: ({ set }, { cellId, mode }) => {
    set(rcSelectedCoordinates, (current) => {
      const newSet = new Set(current);
      switch (mode) {
        case 'add':
          if (current.has(cellId)) {
            newSet.delete(cellId);
          } else {
            newSet.add(cellId);
          }
          break;
        case 'toggle':
        default:
          newSet.clear();
          if (!current.has(cellId)) {
            newSet.add(cellId);
          }
      }
      return newSet;
    });
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

export const rcTxBuffer = atomFamily<Array<DRMessage>, DRBufferId>({
  key: 'TxBuffer',
  default: [],
});

export const rcTxBufferLength = selectorFamily<number, DRBufferId>({
  key: 'TxBufferLength',
  get:
    (bufferId) =>
    ({ get }) =>
      get(rcTxBuffer(bufferId)).length,
});

export const rcPushToTxBuffer = writerFamily<DRMessage, DRBufferId>({
  key: 'PushToTxBuffer',
  set:
    (bufferId) =>
    ({ set }, msg) => {
      set(rcTxBuffer(bufferId), (buffer) => [...buffer, msg]);
    },
});

export const rcRxBuffer = atomFamily<Array<DRMessage>, DRBufferId>({
  key: 'RxBuffer',
  default: [],
});

export const rcRxBufferLength = selectorFamily<number, DRBufferId>({
  key: 'RxBufferLength',
  get:
    (bufferId) =>
    ({ get }) =>
      get(rcRxBuffer(bufferId)).length,
});

export const rcPushToRxBuffer = writerFamily<DRMessage, DRBufferId>({
  key: 'PushToRxBuffer',
  set:
    (bufferId) =>
    ({ set }, msg) => {
      set(rcRxBuffer(bufferId), (buffer) => [...buffer, msg]);
    },
});

export const rcCellList = atom<Set<DRCellId>>({
  key: 'CellList',
  default: new Set(),
});

export const rcInitExistingCells = writer<null>({
  key: 'InitExistingCells',
  set: ({ get, set }) => {
    for (const cellId of get(rcCellList)) {
      set(rcCell(cellId), {
        pending: null,
        state: DRInitialState,
        shared: { state: InitialDRPlayerId, playerCount: 2 },
      });
    }
  },
});

export const rcAddCells = writer<Iterable<DRCellId>>({
  key: 'AddCells',
  set: ({ set }, coordinates) => {
    const added = new Set<DRCellId>();
    for (const cellId of coordinates) {
      set(rcCell(cellId), (c) => {
        if (c) {
          return c;
        }
        added.add(cellId);
        return {
          pending: null,
          state: DRInitialState,
          shared: { state: InitialDRPlayerId, playerCount: 2 },
        };
      });
    }
    if (0 < added.size) {
      set(rcCellList, (current) => new Set([...current, ...added]));
    }
  },
});

export const rcDeleteCells = writer<Iterable<DRCellId>>({
  key: 'DeleteCells',
  set: ({ set, reset }, coordinates) => {
    const deleted = new Set<DRCellId>();
    for (const cellId of coordinates) {
      deleted.add(cellId);
      reset(rcCell(cellId));
    }
    if (0 < deleted.size) {
      set(rcCellList, (current) => {
        const filtered = new Set([...current]);
        for (const cellId of deleted) {
          filtered.delete(cellId);
        }
        return filtered;
      });
    }
  },
});

interface CellUpdates {
  state: DRCellState;
  sharedState: DRPlayerId;
  playerCount: number;
}

export const rcUpdateSelectedCells = writer<Partial<CellUpdates>>({
  key: 'UpdateSelectedCells',
  set: ({ get, set }, updates) => {
    const cellUpdates: Partial<DRCell> = {};
    if ('state' in updates) {
      cellUpdates.state = updates.state;
    }
    const sharedUpdates: Partial<DRCell['shared']> = {};
    if ('sharedState' in updates) {
      sharedUpdates.state = updates.sharedState;
    }
    if ('playerCount' in updates) {
      sharedUpdates.playerCount = updates.playerCount;
    }
    for (const cellId of get(rcSelectedCoordinates)) {
      set(rcCell(cellId), (cell) => {
        if (!cell) {
          return cell;
        }
        return {
          ...cell,
          pending: null,
          ...cellUpdates,
          shared: { ...cell.shared, ...sharedUpdates },
        };
      });
    }
  },
});
