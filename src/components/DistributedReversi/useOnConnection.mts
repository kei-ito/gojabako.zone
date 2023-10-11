import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { toRecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { rcCell } from './recoil.app.mts';
import { sendDRMessage } from './recoil.send.mts';
import type { DRBufferId } from './util.mts';
import { generateMessageProps, getAdjacentId } from './util.mts';

export const useOnConnection = (bufferId: DRBufferId) => {
  const [sent, setSent] = useState(false);
  const adjacentCell = useRecoilValue(rcCell(getAdjacentId(bufferId)));
  const onConnection = useRecoilCallback(
    (cbi) => () => {
      const rso = toRecoilSelectorOpts(cbi);
      const { get } = rso;
      const cell = get(rcCell(bufferId[0]));
      if (cell) {
        sendDRMessage(rso, bufferId[0], {
          ...generateMessageProps(),
          type: 'connect',
          mode: bufferId[1],
          ttl: 1,
          payload: cell.shared,
        });
      }
    },
    [bufferId],
  );
  useEffect(() => {
    if (adjacentCell && !sent) {
      onConnection();
      setSent(true);
    }
  }, [adjacentCell, bufferId, onConnection, sent]);
};
