import type { MouseEvent } from 'react';
import { useRecoilCallback } from 'recoil';
import { rcCell } from './recoil.app.mts';
import { rcSend } from './recoil.send.mts';
import type { DRCellId } from './util.mts';
import { isOwnerId, nextOwnerId, generateMessageProps } from './util.mts';

export const useOnClickCell = (cellId: DRCellId) =>
  useRecoilCallback(
    ({ set }) =>
      (event: MouseEvent) => {
        event.stopPropagation();
        set(rcCell(cellId), (oldCell) => {
          if (!oldCell) {
            return oldCell;
          }
          const { sharedState: state } = oldCell;
          if (isOwnerId(state)) {
            const cell = { ...oldCell };
            set(rcSend(cellId), {
              ...generateMessageProps(),
              mode: 'spread',
              type: 'press',
              state,
            });
            return { ...cell, state, sharedState: nextOwnerId(state) };
          } else {
            return oldCell;
          }
        });
      },
    [cellId],
  );
