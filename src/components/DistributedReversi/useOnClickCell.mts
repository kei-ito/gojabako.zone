import type { MouseEvent } from 'react';
import { useRecoilCallback } from 'recoil';
import { rcAddLog, rcCell, rcMessageBuffer } from './recoil.mts';
import type { DRCoordinate, DRMessagePress } from './util.mts';
import { allTxAndCoordinates, nextOwnerId } from './util.mts';

export const useOnClickCell = (id: DRCoordinate) =>
  useRecoilCallback(
    ({ set }) =>
      (event: MouseEvent) => {
        event.stopPropagation();
        set(rcAddLog, `click: ${id}`);
        set(rcCell(id), (oldCell) => {
          const sharedState = oldCell?.sharedState;
          if (!oldCell || !sharedState || sharedState === 'initial') {
            return oldCell;
          }
          const cell = { ...oldCell };
          for (const [d, to] of allTxAndCoordinates(id)) {
            const msg: DRMessagePress = {
              type: 'press',
              from: id,
              to,
              at: id,
              state: sharedState,
            };
            set(rcMessageBuffer(`${id},${d}`), (buffer) => [...buffer, msg]);
          }
          return {
            ...cell,
            state: sharedState,
            sharedState: nextOwnerId(sharedState),
          };
        });
      },
    [id],
  );
