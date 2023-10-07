import type { MouseEvent } from 'react';
import { useRecoilCallback } from 'recoil';
import { rcCell, rcLog } from './recoil.app.mts';
import { rcSend } from './recoil.send.mts';
import type { DRCellId } from './util.mts';
import { isOwnerId, nextOwnerId } from './util.mts';

export const useOnClickCell = (cellId: DRCellId) =>
  useRecoilCallback(
    ({ set }) =>
      (event: MouseEvent) => {
        event.stopPropagation();
        const logger = rcLog({ cellId, namespace: 'onClick' });
        set(logger, '');
        set(rcCell(cellId), (oldCell) => {
          if (!oldCell) {
            set(logger, 'noCell');
            return oldCell;
          }
          const { sharedState: state } = oldCell;
          if (isOwnerId(state)) {
            const cell = { ...oldCell };
            set(rcSend(cellId), {
              d: [0, 0],
              mode: 'spread',
              type: 'press',
              state,
            });
            return { ...cell, state, sharedState: nextOwnerId(state) };
          } else {
            set(logger, `sharedState:${state}`);
            return oldCell;
          }
        });
      },
    [cellId],
  );
