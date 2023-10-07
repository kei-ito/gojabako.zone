import { writer } from '../../util/recoil/selector.mts';
import { vAdd } from '../../util/vector.mts';
import {
  rcCell,
  rcDirectedRxBuffer,
  rcDirectedTxBuffer,
  rcLog,
} from './recoil.app.mts';
import type { DRCellId, DRDirection } from './util.mts';
import {
  DRAdjacentRxDirection,
  DRAdjacentStep,
  getAdjacentId,
} from './util.mts';

export const rcTransmitMessage = writer<{
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
    set(rcLog({ cellId, namespace: 'tx' }), `${ad} ${JSON.stringify(rMsg)}`);
    set(rcDirectedRxBuffer(`${aId},${ad}`), (buffer) => [...buffer, rMsg]);
  },
});
