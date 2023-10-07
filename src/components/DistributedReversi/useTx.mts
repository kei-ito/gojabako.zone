import { useEffect, useMemo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { noop } from '../../util/noop.mts';
import { writer } from '../../util/recoil/selector.mts';
import { vAdd } from '../../util/vector.mts';
import {
  rcCell,
  rcDirectedRxBuffer,
  rcDirectedTxBuffer,
  rcTxDelayMs,
} from './recoil.app.mts';
import {
  DRAdjacentRxDirection,
  DRAdjacentStep,
  getAdjacentId,
} from './util.mts';
import type { DRCellId, DRDirection } from './util.mts';

export const useTx = (cellId: DRCellId, d: DRDirection) => {
  const tx = useMemo(() => rcDirectedTxBuffer(`${cellId},${d}`), [cellId, d]);
  const transmit = useSetRecoilState(rcTransmitMessage);
  const buffer = useRecoilValue(tx);
  const txDelayMs = useRecoilValue(rcTxDelayMs);
  useEffect(() => {
    if (0 < buffer.length) {
      const timerId = setTimeout(
        () => transmit({ cellId, d }),
        txDelayMs * (0.95 + 0.1 * Math.random()),
      );
      return () => clearTimeout(timerId);
    }
    return noop;
  }, [buffer, d, cellId, transmit, txDelayMs]);
};

const rcTransmitMessage = writer<{
  cellId: DRCellId;
  d: DRDirection;
}>({
  key: 'TransmitMessage',
  set: ({ get, set }, data) => {
    const { cellId, d } = data;
    const tx = rcDirectedTxBuffer(`${cellId},${d}`);
    const buf = get(tx).slice();
    const tMsg = buf.shift();
    set(tx, buf);
    if (!tMsg) {
      return;
    }
    const aId = getAdjacentId(cellId, d);
    if (!get(rcCell(aId))) {
      return;
    }
    const ad = DRAdjacentRxDirection[d];
    const rMsg = { ...tMsg, d: vAdd(tMsg.d, DRAdjacentStep[d]) };
    if (rMsg.ttl) {
      rMsg.ttl -= 1;
    }
    set(rcDirectedRxBuffer(`${aId},${ad}`), (buffer) => [...buffer, rMsg]);
  },
});
