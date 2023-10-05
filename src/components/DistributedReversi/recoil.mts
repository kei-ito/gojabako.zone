import { isNonNegativeSafeInteger } from '@nlib/typing';
import type { ReactNode } from 'react';
import type { GetRecoilValue, SetRecoilState } from 'recoil';
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
import { sign } from '../../util/sign.mts';
import {
  DRDiagonalDirections,
  DRDirections,
  getAdjacentId,
  isDRCoordinate,
  isDRDiagonalDirection,
  isDRDirection,
  parseDRCoordinate,
} from './util.mts';
import type {
  DRCell,
  DRCoordinate,
  DRDiagonalDirection,
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

export const rcDirectedRxBuffer = atomFamily<
  Array<DRMessage>,
  `${DRCoordinate},${DRDirection}`
>({ key: 'DirectedRxBuffer', default: [] });
export const rcReceive = selectorFamily<
  DRMessage | null,
  `${DRCoordinate},${DRDirection}`
>({
  key: 'Receive',
  get: () => () => null,
  set:
    (id) =>
    ({ set }, msg) => {
      if (!msg || msg instanceof DefaultValue) {
        return;
      }
      set(rcDirectedRxBuffer(id), (buffer) => [...buffer, msg]);
    },
});

export const rcDirectedTxBuffer = atomFamily<
  Array<DRMessage>,
  `${DRCoordinate},${DRDirection}`
>({ key: 'DirectedTxBuffer', default: [] });
const rcPushToDirectedTxBuffer = selectorFamily<
  DRMessage | null,
  `${DRCoordinate},${DRDirection}`
>({
  key: 'PushToDirectedTxBuffer',
  get: () => () => null,
  set:
    (id) =>
    ({ set }, msg) => {
      if (!msg || msg instanceof DefaultValue) {
        return;
      }
      set(rcDirectedTxBuffer(id), (buffer) => [...buffer, msg]);
    },
});

type BufferStates = Record<DRDirection, number | null>;
export const rcBufferStates = selectorFamily<BufferStates, DRCoordinate>({
  key: 'BufferStates',
  get:
    (id) =>
    ({ get }) => {
      const states: BufferStates = { e: null, n: null, w: null, s: null };
      for (const d of DRDirections) {
        const cell = get(rcCell(getAdjacentId(id, d)));
        if (cell) {
          states[d] = get(rcDirectedTxBuffer(`${id},${d}`)).length;
        }
      }
      return states;
    },
});

export const rcSend = selectorFamily<DRMessage | null, DRCoordinate>({
  key: 'TxBuffer',
  get: () => () => null,
  set:
    (id) =>
    ({ set, get }, msg) => {
      if (!msg || msg instanceof DefaultValue) {
        return;
      }
      const { to } = msg;
      const { diagonal, rook, bishop } = sendUtils(set, get, id, msg);
      if (id === msg.from) {
        if (to === 'all') {
          for (const d of DRDirections) {
            set(rcPushToDirectedTxBuffer(`${id},${d}`), msg);
          }
        } else if (to === 'rook') {
          rook();
        } else if (to === 'bishop') {
          bishop();
        } else if (to === 'queen') {
          rook();
          bishop();
        }
      } else if (isDRDirection(to)) {
        set(rcPushToDirectedTxBuffer(`${id},${to}`), msg);
      } else if (isDRDiagonalDirection(to)) {
        diagonal(to);
      } else if (isDRCoordinate(to)) {
        const r0 = parseDRCoordinate(id);
        const r1 = parseDRCoordinate(to);
        const dy = sign(r1[1] - r0[1], 'n', 'c', 's');
        const dx = sign(r1[0] - r0[0], 'w', 'c', 'e');
        if (dy === 'c') {
          if (dx !== 'c') {
            set(rcPushToDirectedTxBuffer(`${id},${dx}`), msg);
          }
        } else if (dx === 'c') {
          set(rcPushToDirectedTxBuffer(`${id},${dy}`), msg);
        } else {
          diagonal(`${dy}${dx}`);
        }
      } else if (to === 'all') {
        /** TODO: ここを書く */
      }
    },
});

const sendUtils = (
  set: SetRecoilState,
  get: GetRecoilValue,
  id: DRCoordinate,
  msg: DRMessage,
) => {
  const diagonal = (
    dd: DRDiagonalDirection,
    states = get(rcBufferStates(id)),
  ) => {
    const dList = [...dd] as Array<DRDirection>;
    let minD: DRDirection | null = null;
    let minCount = Infinity;
    for (let i = dList.length; --i; ) {
      const d = dList[i];
      const count = states[d];
      if (isNonNegativeSafeInteger(count)) {
        if (count < minCount) {
          minCount = count;
          minD = d;
        }
      }
    }
    if (minD !== null) {
      states[minD] = minCount + 1;
      set(rcPushToDirectedTxBuffer(`${id},${minD}`), { ...msg, to: dd });
    }
  };
  const rook = () => {
    for (const d of DRDirections) {
      set(rcPushToDirectedTxBuffer(`${id},${d}`), { ...msg, to: d });
    }
  };
  const bishop = (states = get(rcBufferStates(id))) => {
    for (const dd of DRDiagonalDirections) {
      diagonal(dd, states);
    }
  };
  return { diagonal, rook, bishop };
};

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
