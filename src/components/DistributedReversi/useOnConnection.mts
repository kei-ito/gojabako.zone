import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { rcCell } from './recoil.app.mts';
import { rcSend } from './recoil.send.mts';
import type { DRCoordinate, DRDirection } from './util.mts';
import { getAdjacentId } from './util.mts';

export const useOnConnection = (id: DRCoordinate, d: DRDirection) => {
  const [sent, setSent] = useState(false);
  const adjacentCell = useRecoilValue(rcCell(getAdjacentId(id, d)));
  const onConnection = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const cell = snapshot.getLoadable(rcCell(id)).getValue();
        if (cell) {
          const state = cell.sharedState;
          set(rcSend(id), { type: 'connect', d: [0, 0], mode: d, state });
        }
      },
    [id, d],
  );
  useEffect(() => {
    if (adjacentCell && !sent) {
      onConnection();
      setSent(true);
    }
  }, [adjacentCell, onConnection, sent]);
};
