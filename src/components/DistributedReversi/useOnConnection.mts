import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { writer } from '../../util/recoil/selector.mts';
import { rcCell } from './recoil.app.mts';
import { rcSend } from './recoil.send.mts';
import type { DRCellId, DRDirection } from './util.mts';
import { generateMessageProps, getAdjacentId } from './util.mts';

export const useOnConnection = (cellId: DRCellId, d: DRDirection) => {
  const [sent, setSent] = useState(false);
  const adjacentCell = useRecoilValue(rcCell(getAdjacentId(cellId, d)));
  const onConnection = useSetRecoilState(rcOnConnection);
  useEffect(() => {
    if (adjacentCell && !sent) {
      onConnection({ cellId, d });
      setSent(true);
    }
  }, [adjacentCell, cellId, d, onConnection, sent]);
};

const rcOnConnection = writer<{ cellId: DRCellId; d: DRDirection }>({
  key: 'OnConnection',
  set: ({ get, set }, { cellId, d }) => {
    const cell = get(rcCell(cellId));
    if (cell) {
      set(rcSend(cellId), {
        ...generateMessageProps(),
        type: 'connect',
        mode: d,
        ttl: 1,
        gameState: cell.gameState,
        playerCount: cell.playerCount,
      });
    }
  },
});
