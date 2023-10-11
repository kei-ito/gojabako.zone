import type { ChangeEvent } from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { toRecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { DRMessenger } from './Messenger';
import type { CellSelection } from './recoil.app.mts';
import {
  rcCell,
  rcSelectedCells,
  rcSelectedCoordinates,
} from './recoil.app.mts';
import { DRSelector } from './Selector';
import * as style from './style.module.scss';
import type { DRCell, DRCellState, DRPlayerId } from './util.mts';
import { DRInitialState, isDRPlayerId } from './util.mts';

export const DRCellInspector = () => {
  const coordinates = useRecoilValue(rcSelectedCoordinates);
  const selection = useRecoilValue(rcSelectedCells);
  const coordinateCount = coordinates.size;
  const cellCount = selection.map.size;
  if (coordinateCount === 0) {
    return null;
  }
  if (cellCount === 0) {
    return <p>{coordinateCount}個の座標を選択中</p>;
  }
  return (
    <>
      <p>{coordinateCount}個の座標を選択中</p>
      <StateSelector {...selection} />
      <SharedStateSelector {...selection} />
      <PlayerCountControl value={selection.maxPlayerCount} />
      <hr />
      <DRMessenger />
    </>
  );
};

const StateSelector = ({ maxPlayerCount }: CellSelection) => {
  const update = useUpdateSelectedCells();
  const onChange = useCallback(
    (value: string) => {
      if (value === DRInitialState) {
        update({ state: DRInitialState });
      } else if (value) {
        const state = Number(value);
        if (isDRPlayerId(state)) {
          update({ state });
        }
      }
      return '';
    },
    [update],
  );
  const values = useMemo(
    () => [
      ...(function* () {
        yield '';
        yield DRInitialState;
        for (let player = 0; player < maxPlayerCount; player++) {
          yield player;
        }
      })(),
    ],
    [maxPlayerCount],
  );
  return (
    <DRSelector
      id="CellState"
      label="state"
      onChange={onChange}
      values={values}
    />
  );
};

const SharedStateSelector = ({ maxPlayerCount }: CellSelection) => {
  const update = useUpdateSelectedCells();
  const onChange = useCallback(
    (value: string) => {
      const sharedState = value && Number(value);
      if (isDRPlayerId(sharedState)) {
        update({ sharedState });
      }
      return '';
    },
    [update],
  );
  const values = useMemo(
    () => [
      ...(function* () {
        yield '';
        for (let player = 0; player < maxPlayerCount; player++) {
          yield player;
        }
      })(),
    ],
    [maxPlayerCount],
  );
  return (
    <DRSelector
      id="CellSharedState"
      label="sharedState"
      onChange={onChange}
      values={values}
    />
  );
};

const PlayerCountControl = ({ value }: { value: number }) => {
  const update = useUpdateSelectedCells();
  const onChange = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
      let playerCount = Number(currentTarget.value);
      if (!(1 < playerCount)) {
        playerCount = 2;
      }
      update({ playerCount });
    },
    [update],
  );
  const id = 'CellSharedPlayerCount';
  return (
    <section className={style.number}>
      <label htmlFor={id}>playerCount</label>
      <input id={id} type="number" step={1} value={value} onChange={onChange} />
    </section>
  );
};

interface CellUpdates {
  state?: DRCellState;
  sharedState?: DRPlayerId;
  playerCount?: number;
}

const useUpdateSelectedCells = () =>
  useRecoilCallback(
    (cbi) => (updates: CellUpdates) => {
      const { get, set } = toRecoilSelectorOpts(cbi);
      const cellUpdates: Partial<DRCell> = {};
      if ('state' in updates) {
        cellUpdates.state = updates.state;
      }
      const sharedUpdates: Partial<DRCell['shared']> = {};
      if ('sharedState' in updates) {
        sharedUpdates.state = updates.sharedState;
      }
      if ('playerCount' in updates) {
        sharedUpdates.playerCount = updates.playerCount;
      }
      for (const cellId of get(rcSelectedCoordinates)) {
        set(rcCell(cellId), (cell) => {
          if (!cell) {
            return cell;
          }
          return {
            ...cell,
            pending: null,
            ...cellUpdates,
            shared: { ...cell.shared, ...sharedUpdates },
          };
        });
      }
    },
    [],
  );
