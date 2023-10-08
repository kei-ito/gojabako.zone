import { useEffect } from 'react';
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
import type { DRBufferId } from './util.mts';
import {
  DRAdjacentRxDirection,
  DRAdjacentStep,
  getAdjacentId,
  toDRBufferId,
} from './util.mts';

export const useTx = (bufferId: DRBufferId) => {
  const transmit = useSetRecoilState(rcTransmitMessage);
  const buffer = useRecoilValue(rcDirectedTxBuffer(bufferId));
  const txDelayMs = useRecoilValue(rcTxDelayMs);
  useEffect(() => {
    if (0 < buffer.length) {
      const timerId = setTimeout(
        () => transmit(bufferId),
        txDelayMs * (0.95 + 0.1 * Math.random()),
      );
      return () => clearTimeout(timerId);
    }
    return noop;
  }, [buffer, bufferId, transmit, txDelayMs]);
};

const rcTransmitMessage = writer<DRBufferId>({
  key: 'TransmitMessage',
  set: ({ get, set }, bufferId) => {
    const [cellId, d] = bufferId;
    const tx = rcDirectedTxBuffer(bufferId);
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
    set(rcDirectedRxBuffer(toDRBufferId(aId, ad)), (buffer) => [
      ...buffer,
      rMsg,
    ]);
  },
});
