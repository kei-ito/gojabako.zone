import type { ReactNode } from 'react';
import { DefaultValue, atom, atomFamily, selector } from 'recoil';
import { clamp } from '../../util/clamp.mts';
import { writer, writerFamily } from '../../util/recoil/selector.mts';
import {
  syncSearchParamsBoolean,
  syncSearchParamsNumber,
} from '../../util/recoil/syncSearchParams.mts';
import { DRInitialState } from './util.mts';
import type {
  DRBufferId,
  DRCell,
  DRCellId,
  DREventLog,
  DREventLogViewOptions,
  DRMessage,
} from './util.mts';

export const zoom = { min: 40, max: 200 };

export const rcTooltip = atom<ReactNode>({ key: 'Tooltip', default: null });
export const rcPointerPosition = atom<[number, number]>({
  key: 'PointerPosition',
  default: [0, 0],
  effects: [
    ({ setSelf }) => {
      const abc = new AbortController();
      addEventListener('pointermove', (e) => setSelf([e.clientX, e.clientY]), {
        signal: abc.signal,
      });
      return () => abc.abort();
    },
  ],
});
export const rcTxDelayMs = atom<number>({
  key: 'TxDelayMs',
  effects: [...syncSearchParamsNumber('txd', 300)],
});
export const rcRxDelayMs = atom<number>({
  key: 'RxDelayMs',
  effects: [...syncSearchParamsNumber('rxd', 300)],
});
export const rcShowLog = atom<boolean>({
  key: 'ShowLog',
  effects: [...syncSearchParamsBoolean('log', true)],
});
export const rcLogViewerOptions = atom<DREventLogViewOptions>({
  key: 'LogViewerOptions',
  default: { time: 'diff', cellId: null, namespace: null },
});

export const rcLogBuffer = atom<Array<DREventLog>>({
  key: 'LogBuffer',
  default: [],
  effects: [
    ({ onSet, setSelf, getLoadable }) => {
      const setInitialLog = (list: Array<DREventLog>) => {
        if (0 < list.length) {
          return;
        }
        const time = performance.now();
        const message = new Date().toISOString();
        setSelf([{ cellId: '0,0', time, namespace: 'game', message }]);
      };
      onSet(setInitialLog);
      setInitialLog(getLoadable(rcLogBuffer).getValue());
    },
  ],
});
export const rcLog = writerFamily<
  string,
  { cellId: DRCellId; namespace: string }
>({
  key: 'PushLog',
  set:
    ({ cellId, namespace }) =>
    ({ set }, message) => {
      const time = performance.now();
      const item: DREventLog = { cellId, time, namespace, message };
      set(rcLogBuffer, (list) => [...list, item]);
    },
});

type XYWHZ =
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
      state: DRInitialState,
      sharedState: DRInitialState,
      pending: null,
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
