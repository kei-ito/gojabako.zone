import type { MouseEvent } from 'react';
import { useRecoilCallback } from 'recoil';
import { rcLog, rcCell, rcMessageBuffer } from './recoil.mts';
import type { DRCoordinate, DRMessagePress } from './util.mts';
import { allTxAndCoordinates, nextOwnerId } from './util.mts';

export const useOnClickCell = (id: DRCoordinate) =>
  useRecoilCallback(
    ({ set }) =>
      (event: MouseEvent) => {
        event.stopPropagation();
        const logger = rcLog([id, 'onClick']);
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
