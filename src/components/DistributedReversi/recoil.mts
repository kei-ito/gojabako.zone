import type { ReactNode } from 'react';
import type { GetRecoilValue, ResetRecoilState, SetRecoilState } from 'recoil';
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
import { vAdd } from '../../util/vector.mts';
import type {
  DRCell,
  DRCoordinate,
  DRDiagonalDirection,
  DRDirection,
  DREventLog,
  DREventLogViewOptions,
  DRMessage,
} from './util.mts';
import {
  DRAdjacentRxDirection,
  DRAdjacentStep,
  DRDiagonalDirections,
  DRDirections,
  getAdjacentId,
  getMessageDirection,
  isDRDiagonalDirection,
  isDRDirection,
} from './util.mts';

interface RecoilSetterArg {
  get: GetRecoilValue;
  set: SetRecoilState;
  reset: ResetRecoilState;
}

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
export const rcLog = selectorFamily<
  string,
  { id: DRCoordinate; namespace: string }
>({
  key: 'PushLog',
  get: () => () => '',
  set:
    ({ id, namespace }) =>
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

export const rcDirectedTxBuffer = atomFamily<
  Array<DRMessage>,
  `${DRCoordinate},${DRDirection}`
>({ key: 'DirectedTxBuffer', default: [] });

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
  set: (id) => (args, msg) => {
    if (!msg || msg instanceof DefaultValue) {
      return;
    }
    const { mode } = msg;
    if (isDRDirection(mode)) {
      sendD(args, id, mode, msg);
    } else if (isDRDiagonalDirection(mode)) {
      sendDD(args, id, mode, msg);
    } else if (mode === 'spread') {
      const [dx, dy] = getMessageDirection(msg.d);
      if (dy === 'c') {
        if (dx === 'c') {
          for (const d of DRDirections) {
            sendD(args, id, d, msg);
          }
        } else {
          sendD(args, id, 'n', msg);
          sendD(args, id, 's', msg);
        }
      } else {
        sendD(args, id, dy, msg);
      }
    } else {
      const rook = () => DRDirections.forEach((d) => sendD(args, id, d, msg));
      const bishop = () =>
        DRDiagonalDirections.forEach((dd) => sendDD(args, id, dd, msg));
      const queen = () => {
        rook();
        bishop();
      };
      ({ rook, bishop, queen })[mode]();
    }
  },
});

const sendD = (
  { get, set }: RecoilSetterArg,
  id: DRCoordinate,
  d: DRDirection,
  msg: DRMessage,
) => {
  const adjacentId = getAdjacentId(id, d);
  const adjacentCell = get(rcCell(adjacentId));
  if (adjacentCell) {
    set(rcDirectedTxBuffer(`${id},${d}`), (buffer) => [...buffer, msg]);
  }
};

const sendDD = (
  { get, set }: RecoilSetterArg,
  id: DRCoordinate,
  dd: DRDiagonalDirection,
  msg: DRMessage,
) => {
  let min: [number, DRDirection] | null = null;
  for (const d of dd as Iterable<DRDirection>) {
    const adjacentId = getAdjacentId(id, d);
    const adjacentCell = get(rcCell(adjacentId));
    if (adjacentCell) {
      const count = get(rcDirectedTxBuffer(`${id},${d}`)).length;
      if (!min || count < min[0]) {
        min = [count, d];
      }
    }
  }
  if (min) {
    // sendD()でよいですが存在チェックが済んでいるので直接set()します
    set(rcDirectedTxBuffer(`${id},${min[1]}`), (buffer) => [...buffer, msg]);
  }
};

export const rcTransmitMessage = selector<{
  id: DRCoordinate;
  d: DRDirection;
} | null>({
  key: 'TransmitMessage',
  get: () => null,
  set: ({ get, set }, data) => {
    if (!data || data instanceof DefaultValue) {
      return;
    }
    const { id, d } = data;
    const tx = rcDirectedTxBuffer(`${id},${d}`);
    const buf = get(tx).slice();
    const msg = buf.shift();
    set(tx, buf);
    if (!msg) {
      return;
    }
    const aId = getAdjacentId(id, d);
    if (!get(rcCell(aId))) {
      return;
    }
    const ad = DRAdjacentRxDirection[d];
    set(rcLog({ id, namespace: 'tx' }), `${ad} ${JSON.stringify(msg)}`);
    set(rcDirectedRxBuffer(`${aId},${ad}`), (buffer) => [
      ...buffer,
      { ...msg, d: vAdd(msg.d, DRAdjacentStep[d]) },
    ]);
  },
});

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
