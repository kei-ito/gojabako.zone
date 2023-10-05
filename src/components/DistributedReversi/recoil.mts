import type { ReactNode } from 'react';
import { DefaultValue, atom, atomFamily, selector } from 'recoil';
import { clamp } from '../../util/clamp.mts';
import type { DRCell, DRCoordinate, DRDirection, DRMessage } from './util.mts';

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
export const rcTxDelayMs = atom<number>({ key: 'TxDelayMs', default: 300 });
export const rcRxDelayMs = atom<number>({ key: 'RxDelayMs', default: 300 });

type XYWHZ =
  | [number, number, number, number, number, [number, number]]
  | [number, number, number, number, number];

export const rcXYWHZ = atom<XYWHZ>({
  key: 'XYZ',
  default: [0, 0, 0, 0, 100],
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
