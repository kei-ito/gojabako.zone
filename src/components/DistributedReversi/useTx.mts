import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { noop } from '../../util/noop.mts';
import { toRecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { vAdd } from '../../util/vector.mts';
import {
  rcCell,
  rcDevMode,
  rcRxBuffer,
  rcTxBuffer,
  rcTxDelayMs,
} from './recoil.app.mts';
import type { DRBufferId } from './util.mts';
import {
  OppositeDRDirection,
  DRAdjacentStep,
  getAdjacentId,
  toDRBufferId,
} from './util.mts';

export const useTx = (bufferId: DRBufferId) => {
  const transmit = useTransmit(bufferId);
  const txBufferLength = useRecoilValue(rcTxBuffer(bufferId)).length;
  const txDelayMs = useRecoilValue(rcTxDelayMs);
  const debug = useRecoilValue(rcDevMode);
  const delayMs = debug ? txDelayMs : 0;
  useEffect(() => {
    if (0 < txBufferLength) {
      const timerId = setTimeout(transmit, delayMs);
      return () => clearTimeout(timerId);
    }
    return noop;
  }, [txBufferLength, bufferId, transmit, delayMs]);
};

const useTransmit = (bufferId: DRBufferId) =>
  useRecoilCallback(
    (cbi) => () => {
      const { get, set } = toRecoilSelectorOpts(cbi);
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
      const rMsg = { ...tMsg, d: vAdd(tMsg.d, DRAdjacentStep[d]) };
      if (rMsg.ttl) {
        rMsg.ttl -= 1;
      }
      set(rcRxBuffer(toDRBufferId(adjacentId, OppositeDRDirection[d])), (b) => [
        ...b,
        rMsg,
      ]);
    },
    [bufferId],
  );
