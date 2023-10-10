import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { iterate } from '../../util/iterate.mts';
import { writer } from '../../util/recoil/selector.mts';
import { rcCell, rcDragging } from './recoil.app.mts';
import { rcSend } from './recoil.send.mts';
import type { DRCellId } from './util.mts';
import {
  DRDiagonalDirections,
  DRDirections,
  generateMessageProps,
  stepDRSharedState,
} from './util.mts';

export const useOnPressCell = (cellId: DRCellId) => {
  const press = useSetRecoilState(rcPressCell);
  return useCallback(() => press(cellId), [cellId, press]);
};

const rcPressCell = writer<DRCellId>({
  key: 'PressCell',
  set: ({ get, set }, cellId) => {
    if (get(rcDragging)) {
      return;
    }
    const cell = get(rcCell(cellId));
    if (!cell) {
      return;
    }
    for (const mode of iterate(DRDirections, DRDiagonalDirections)) {
      set(rcSend(cellId), {
        ...generateMessageProps(),
        mode,
        type: 'reversi1',
        payload: cell.shared,
      });
    }
    const nextSharedState = stepDRSharedState(cell.shared);
    set(rcSend(cellId), {
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
});
