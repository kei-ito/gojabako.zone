import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { rcCell, rcMessageBuffer } from './recoil.mts';
import type { DRCoordinate, DRDirection, DRMessageSetShared } from './util.mts';
import { getAdjacentId } from './util.mts';

export const useOnConnection = (id: DRCoordinate, d: DRDirection) => {
  const [sent, setSent] = useState(false);
  const adjacentCell = useRecoilValue(rcCell(getAdjacentId(id, d)));
  const onConnection = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const cell = snapshot.getLoadable(rcCell(id)).getValue();
        if (cell) {
          const msg: DRMessageSetShared = {
            type: 'setShared',
            from: id,
            to: getAdjacentId(id, d),
            state: cell.sharedState,
          };
          set(rcMessageBuffer(`${id},tx${d}`), (buffer) => [...buffer, msg]);
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
