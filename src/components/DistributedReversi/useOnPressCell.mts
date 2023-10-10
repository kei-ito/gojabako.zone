import { useRecoilCallback } from 'recoil';
import { iterate } from '../../util/iterate.mts';
import { toSelectorOpts } from '../../util/recoil/selector.mts';
import { rcCell, rcDragging } from './recoil.app.mts';
import { sendDRMessage } from './recoil.send.mts';
import type { DRCellId } from './util.mts';
import {
  DRDiagonalDirections,
  DRDirections,
  generateMessageProps,
  stepDRSharedState,
} from './util.mts';

export const useOnPressCell = (cellId: DRCellId) =>
  useRecoilCallback(
    (cbi) => () => {
      const args = toSelectorOpts(cbi);
      const { get, set } = args;
      if (get(rcDragging)) {
        return;
      }
      const cell = get(rcCell(cellId));
      if (!cell) {
        return;
      }
      for (const mode of iterate(DRDirections, DRDiagonalDirections)) {
        sendDRMessage(args, cellId, {
          ...generateMessageProps(),
          mode,
          type: 'reversi1',
          payload: cell.shared,
        });
      }
      const nextSharedState = stepDRSharedState(cell.shared);
      sendDRMessage(args, cellId, {
        ...generateMessageProps(),
        mode: 'spread',
        type: 'setShared',
        payload: nextSharedState,
      });
      set(rcCell(cellId), {
        ...cell,
        state: cell.shared.state,
        shared: nextSharedState,
      });
    },
    [cellId],
  );
