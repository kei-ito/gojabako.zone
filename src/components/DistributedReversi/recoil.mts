import type { ReactNode } from 'react';
import {
  DefaultValue,
  atom,
  atomFamily,
  selector,
  selectorFamily,
} from 'recoil';
import { clamp } from '../../util/clamp.mts';
import {
  syncSearchParamsBoolean,
  syncSearchParamsNumber,
} from '../../util/recoil/syncSearchParams.mts';
import type {
  DRCell,
  DRCoordinate,
  DRDirection,
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
  default: { time: 'diff', id: null, namespace: null },
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
        setSelf([{ id: '0,0', time, namespace: 'game', message }]);
      };
      onSet(setInitialLog);
      setInitialLog(getLoadable(rcLogBuffer).getValue());
    },
  ],
});
export const rcLog = selectorFamily<string, [DRCoordinate, string]>({
  key: 'PushLog',
  get: () => () => '',
  set:
    ([id, namespace]) =>
    ({ set }, message) => {
      if (message instanceof DefaultValue) {
        return;
      }
      const time = performance.now();
      const item: DREventLog = { id, time, namespace, message };
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

export const rcCell = atomFamily<DRCell | null, DRCoordinate>({
  key: 'Cell',
  default: null,
});

export const rcMessageBuffer = atomFamily<
  Array<DRMessage>,
  `${DRCoordinate},${'rx' | 'tx'}${DRDirection}`
>({ key: 'MessageBuffer', default: [] });

export const rcCellList = atom<Set<DRCoordinate>>({
  key: 'CellList',
  default: new Set(),
});

export const rcInitCell = selector<DRCoordinate>({
  key: 'InitCell',
  get: () => `0,0`,
  set: ({ set }, id) => {
    if (id instanceof DefaultValue) {
      return;
    }
    set(rcCell(id), {
      id,
      state: 'initial',
      sharedState: 'initial',
      pending: null,
    });
    set(rcCellList, (list) => {
      if (list.has(id)) {
        return list;
      }
      return new Set(list).add(id);
    });
  },
});

export const rcAddCell = selector<DRCoordinate>({
  key: 'AddCell',
  get: () => `0,0`,
  set: ({ get, set }, coordinate) => {
    if (coordinate instanceof DefaultValue) {
      return;
    }
    const cell = get(rcCell(coordinate));
    if (!cell) {
      set(rcInitCell, coordinate);
    }
  },
});
