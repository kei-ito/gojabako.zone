import { DefaultValue, atom, atomFamily, selector } from 'recoil';
import { clamp as c } from '../../util/clamp.mts';
import { parseDRCoordinate } from './util.mts';
import type { DRCell, DRCoordinate, DRMessage } from './util.mts';

export const zoom = (() => {
  const logMin = -0.5;
  const logMax = 1;
  const logClamp = (value: number) => c(value, logMin, logMax);
  const min = Math.E ** logMin;
  const max = Math.E ** logMax;
  const clamp = (value: number) => c(value, min, max);
  return { logMin, logMax, logClamp, min, max, clamp };
})();

type XYWHZ = [number, number, number, number, number];

export const rcXYWHZ = atom<XYWHZ>({
  key: 'rcXYZ',
  default: [0, 0, 0, 0, 1],
});

export const rcZoom = selector<{ z: number; cx: number; cy: number }>({
  key: 'rcZoom',
  get: ({ get }) => ({ z: get(rcXYWHZ)[4], cx: 0, cy: 0 }),
  set: ({ set }, value) => {
    if (value instanceof DefaultValue) {
      return;
    }
    set(rcXYWHZ, ([x, y, w, h, z]) => {
      const newZ = zoom.clamp(value.z);
      const rz = newZ / z;
      const newW = w * rz;
      const newH = h * rz;
      const newX = x - (newW - w) * value.cx;
      const newY = y - (newH - h) * value.cy;
      return [newX, newY, newW, newH, newZ] as XYWHZ;
    });
  },
});

export const rcZoomLog = selector<number>({
  key: 'rcZoomLog',
  get: ({ get }) => Math.log(get(rcXYWHZ)[4]),
  set: ({ set }, value) => {
    if (value instanceof DefaultValue) {
      return;
    }
    set(rcZoom, { z: Math.E ** value, cx: 0.5, cy: 0.5 });
  },
});

export const rcCell = atomFamily<DRCell | null, DRCoordinate>({
  key: 'rcCell',
  default: null,
  effects: [
    ({ onSet, setSelf }) => {
      onSet((cell) => {
        if (!cell) {
          return;
        }
        const nextCell: DRCell = {
          ...cell,
          rxb: [],
          rxt: [],
          rxl: [],
          rxr: [],
        };
        for (const d of ['l', 'r', 'b', 't'] as const) {
          for (const m of cell[`rx${d}` as const]) {
            if (m.type === 'setShared') {
              if (m.state === 'initial') {
                if (nextCell.sharedState === 'initial') {
                  nextCell.sharedState = 0;
                }
              } else {
                nextCell.sharedState = m.state;
              }
            }
          }
        }
        setSelf(nextCell);
      });
    },
  ],
});

export const rcCellList = atom<Set<DRCoordinate>>({
  key: 'rcCellList',
  default: new Set(),
});

export const rcInitCell = selector<DRCoordinate>({
  key: 'rcInitCell',
  get: () => `0,0`,
  set: ({ set }, coordinate) => {
    if (coordinate instanceof DefaultValue) {
      return;
    }
    set(rcCell(coordinate), {
      state: 'initial',
      sharedState: 'initial',
      rxt: [],
      rxr: [],
      rxb: [],
      rxl: [],
    });
    set(rcCellList, (list) => {
      if (list.has(coordinate)) {
        return list;
      }
      return new Set(list).add(coordinate);
    });
  },
});

export const rcSendMessage = selector<
  (DRMessage & { from: DRCoordinate; to: DRCoordinate }) | null
>({
  key: 'rcSendMessage',
  get: () => null,
  set: ({ set }, item) => {
    if (!item || item instanceof DefaultValue) {
      return;
    }
    const { from, to, ...message } = item;
    set(rcCell(to), (cell) => {
      if (cell) {
        const [x1, y1] = parseDRCoordinate(from);
        const [x2, y2] = parseDRCoordinate(to);
        if (x1 < x2) {
          return { ...cell, rxl: [...cell.rxl, message] };
        }
        if (x2 < x1) {
          return { ...cell, rxr: [...cell.rxr, message] };
        }
        if (y1 < y2) {
          return { ...cell, rxt: [...cell.rxt, message] };
        }
        if (y2 < y1) {
          return { ...cell, rxb: [...cell.rxb, message] };
        }
      }
      return cell;
    });
  },
});
