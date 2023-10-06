import { DefaultValue, selector } from 'recoil';
import { vAdd } from '../../util/vector.mts';
import {
  rcCell,
  rcDirectedRxBuffer,
  rcDirectedTxBuffer,
  rcLog,
} from './recoil.app.mts';
import type { DRCoordinate, DRDirection } from './util.mts';
import {
  DRAdjacentRxDirection,
  DRAdjacentStep,
  getAdjacentId,
} from './util.mts';

export const rcTransmitMessage = selector<{
  id: DRCoordinate;
  d: DRDirection;
} | null>({
  key: 'TransmitMessage',
  get: () => null,
  set: ({ get, set }, data) => {
    if (!data || data instanceof DefaultValue) {
      return;
    }
    const { id, d } = data;
    const tx = rcDirectedTxBuffer(`${id},${d}`);
    const buf = get(tx).slice();
    const msg = buf.shift();
    set(tx, buf);
    if (!msg) {
      return;
    }
    const aId = getAdjacentId(id, d);
    if (!get(rcCell(aId))) {
      return;
    }
    const ad = DRAdjacentRxDirection[d];
    set(rcLog({ id, namespace: 'tx' }), `${ad} ${JSON.stringify(msg)}`);
    set(rcDirectedRxBuffer(`${aId},${ad}`), (buffer) => [
      ...buffer,
      { ...msg, d: vAdd(msg.d, DRAdjacentStep[d]) },
    ]);
  },
});
