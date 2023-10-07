import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { rcCell } from './recoil.app.mts';
import { rcSend } from './recoil.send.mts';
import type { DRCellId, DRDirection } from './util.mts';
import { getAdjacentId } from './util.mts';

export const useOnConnection = (cellId: DRCellId, d: DRDirection) => {
  const [sent, setSent] = useState(false);
  const adjacentCell = useRecoilValue(rcCell(getAdjacentId(cellId, d)));
  const onConnection = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const cell = snapshot.getLoadable(rcCell(cellId)).getValue();
        if (cell) {
          const state = cell.sharedState;
          set(rcSend(cellId), {
            type: 'connect',
            d: [0, 0],
            mode: d,
            state,
            ttl: 1,
          });
        }
      },
    [cellId, d],
  );
  useEffect(() => {
    if (adjacentCell && !sent) {
      onConnection();
      setSent(true);
    }
  }, [adjacentCell, onConnection, sent]);
};
