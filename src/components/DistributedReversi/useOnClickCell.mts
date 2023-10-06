import type { MouseEvent } from 'react';
import { useRecoilCallback } from 'recoil';
import { rcCell, rcLog } from './recoil.app.mts';
import { rcSend } from './recoil.send.mts';
import type { DRCoordinate } from './util.mts';
import { nextOwnerId } from './util.mts';

export const useOnClickCell = (id: DRCoordinate) =>
  useRecoilCallback(
    ({ set }) =>
      (event: MouseEvent) => {
        event.stopPropagation();
        const logger = rcLog({ id, namespace: 'onClick' });
        set(logger, '');
        set(rcCell(id), (oldCell) => {
          if (!oldCell) {
            set(logger, 'noCell');
            return oldCell;
          }
          const { sharedState } = oldCell;
          if (sharedState === 'initial') {
            set(logger, `sharedState:${sharedState}`);
            return oldCell;
          }
          const cell = { ...oldCell };
          set(rcSend(id), {
            d: [0, 0],
            mode: 'queen',
            type: 'press' as const,
            state: sharedState,
          });
          return {
            ...cell,
            state: sharedState,
            sharedState: nextOwnerId(sharedState),
          };
        });
      },
    [id],
  );
