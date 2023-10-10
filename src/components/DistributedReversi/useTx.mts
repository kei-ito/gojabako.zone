import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { noop } from '../../util/noop.mts';
import { writer } from '../../util/recoil/selector.mts';
import { vAdd } from '../../util/vector.mts';
import {
  rcCell,
  rcDevMode,
  rcTxBuffer,
  rcPushToRxBuffer,
  rcTxDelayMs,
  rcTxBufferLength,
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
  const txBufferLength = useRecoilValue(rcTxBufferLength(bufferId));
  const txDelayMs = useRecoilValue(rcTxDelayMs);
  const debug = useRecoilValue(rcDevMode);
  const delayMs = debug ? txDelayMs : 0;
  useEffect(() => {
    if (0 < txBufferLength) {
      const timerId = setTimeout(() => transmit(bufferId), delayMs);
      return () => clearTimeout(timerId);
    }
    return noop;
  }, [txBufferLength, bufferId, transmit, delayMs]);
};

const rcTransmitMessage = writer<DRBufferId>({
  key: 'TransmitMessage',
  set: ({ get, set }, bufferId) => {
    const buf = get(rcTxBuffer(bufferId)).slice();
    const tMsg = buf.shift();
    set(rcTxBuffer(bufferId), buf);
    if (!tMsg) {
      return;
    }
    const adjacentId = getAdjacentId(bufferId);
    if (!get(rcCell(adjacentId))) {
      return;
    }
    const d = bufferId[1];
    const ad = DRAdjacentRxDirection[d];
    const rMsg = { ...tMsg, d: vAdd(tMsg.d, DRAdjacentStep[d]) };
    if (rMsg.ttl) {
      rMsg.ttl -= 1;
    }
    set(rcPushToRxBuffer(toDRBufferId(adjacentId, ad)), rMsg);
  },
});
