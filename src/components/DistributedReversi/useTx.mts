import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { noop } from '../../util/noop.mts';
import { toRecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { vAdd } from '../../util/vector.mts';
import {
  rcCell,
  rcDevMode,
  rcMessageBuffer,
  rcTxDelayMs,
} from './recoil.app.mts';
import type { DRBufferId } from './util.mts';
import {
  OppositeDRDirection,
  DRAdjacentStep,
  getAdjacentId,
  toDRBufferId,
  isOpenableDRMessage,
} from './util.mts';

export const useTx = (bufferId: DRBufferId) => {
  const transmit = useTransmit(bufferId);
  const txBufferLength = useRecoilValue(rcMessageBuffer(bufferId)).length;
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
      const buf = get(rcMessageBuffer(bufferId)).slice();
      const tMsg = buf.shift();
      set(rcMessageBuffer(bufferId), buf);
      if (!tMsg) {
        return;
      }
      const adjacentId = getAdjacentId(bufferId);
      if (!get(rcCell(adjacentId))) {
        return;
      }
      const d = bufferId[1];
      const rMsg = { ...tMsg, d: vAdd(tMsg.d, DRAdjacentStep[d]) };
      if (rMsg.ttl && isOpenableDRMessage(rMsg)) {
        rMsg.ttl -= 1;
      }
      set(
        rcMessageBuffer(toDRBufferId(adjacentId, OppositeDRDirection[d], 'rx')),
        (b) => [...b, rMsg],
      );
    },
    [bufferId],
  );
