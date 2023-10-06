import type { GetRecoilValue, ResetRecoilState, SetRecoilState } from 'recoil';
import { DefaultValue, selectorFamily } from 'recoil';
import { rcCell, rcDirectedTxBuffer } from './recoil.app.mts';
import type {
  DRCoordinate,
  DRDiagonalDirection,
  DRDirection,
  DRMessage,
} from './util.mts';
import {
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

export const rcSend = selectorFamily<DRMessage | null, DRCoordinate>({
  key: 'Send',
  get: () => () => null,
  set: (id) => (args, msg) => {
    if (!msg || msg instanceof DefaultValue) {
      return;
    }
    const { mode } = msg;
    if (isDRDirection(mode)) {
      sendD(args, id, msg, [mode]);
    } else if (isDRDiagonalDirection(mode)) {
      sendDD(args, id, msg, [mode]);
    } else {
      const [dx, dy] = getMessageDirection(msg.d);
      if (mode === 'spread') {
        if (dy === 'c') {
          sendD(args, id, msg, dx === 'c' ? DRDirections : ['n', 's']);
        } else {
          sendD(args, id, msg, [dy]);
        }
      } else {
        const rook = () => {
          if (dx === 'c') {
            sendD(args, id, msg, dy === 'c' ? DRDirections : [dy]);
          } else if (dy === 'c') {
            sendD(args, id, msg, [dx]);
          }
        };
        const bishop = () => {
          if (dx === 'c' && dy === 'c') {
            sendDD(args, id, msg, DRDiagonalDirections);
          }
        };
        const queen = () => {
          rook();
          bishop();
        };
        ({ rook, bishop, queen })[mode]();
      }
    }
  },
});

const sendD = (
  { get, set }: RecoilSetterArg,
  id: DRCoordinate,
  msg: DRMessage,
  list: Iterable<DRDirection>,
) => {
  for (const d of list) {
    const adjacentId = getAdjacentId(id, d);
    const adjacentCell = get(rcCell(adjacentId));
    if (adjacentCell) {
      set(rcDirectedTxBuffer(`${id},${d}`), (buffer) => [
        ...buffer,
        { ...msg },
      ]);
    }
  }
};

const sendDD = (
  { get, set }: RecoilSetterArg,
  id: DRCoordinate,
  msg: DRMessage,
  list: Iterable<DRDiagonalDirection>,
) => {
  for (const dd of list) {
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
      set(rcDirectedTxBuffer(`${id},${min[1]}`), (buffer) => [
        ...buffer,
        { ...msg, mode: dd },
      ]);
    }
  }
};
