import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { writer } from '../../util/recoil/selector.mts';
import { rcCell } from './recoil.app.mts';
import { rcSend } from './recoil.send.mts';
import type { DRBufferId } from './util.mts';
import { generateMessageProps, getAdjacentId } from './util.mts';

export const useOnConnection = (bufferId: DRBufferId) => {
  const [sent, setSent] = useState(false);
  const adjacentCell = useRecoilValue(rcCell(getAdjacentId(bufferId)));
  const onConnection = useSetRecoilState(rcOnConnection);
  useEffect(() => {
    if (adjacentCell && !sent) {
      onConnection(bufferId);
      setSent(true);
    }
  }, [adjacentCell, bufferId, onConnection, sent]);
};

const rcOnConnection = writer<DRBufferId>({
  key: 'OnConnection',
  set: ({ get, set }, [cellId, d]) => {
    const cell = get(rcCell(cellId));
    if (cell) {
      set(rcSend(cellId), {
        ...generateMessageProps(),
        type: 'connect',
        mode: d,
        ttl: 1,
        payload: cell.shared,
      });
    }
  },
});
