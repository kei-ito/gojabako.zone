import type { ChangeEvent } from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { toSelectorOpts } from '../../util/recoil/selector.mts';
import { SecondaryButton } from '../Button';
import { DRMessenger } from './Messenger';
import type { CellSelection } from './recoil.app.mts';
import {
  rcCell,
  rcCellList,
  rcDevMode,
  rcSelectedCells,
  rcSelectedCoordinates,
} from './recoil.app.mts';
import { DRSelector } from './Selector';
import * as style from './style.module.scss';
import type { DRCell, DRCellId, DRCellState, DRPlayerId } from './util.mts';
import { DRInitialState, InitialDRPlayerId, isDRPlayerId } from './util.mts';

export const DRCellInspector = () => {
  const devMode = useRecoilValue(rcDevMode);
  const coordinates = useRecoilValue(rcSelectedCoordinates);
  const selection = useRecoilValue(rcSelectedCells);
  if (!devMode) {
    return null;
  }
  const coordinateCount = coordinates.size;
  const cellCount = selection.map.size;
  if (coordinateCount === 0) {
    return <NoSelection />;
  }
  if (cellCount === 0) {
    return (
      <>
        <p>{coordinateCount}個の座標を選択中</p>
        <AddCellButton coordinates={coordinates} />
      </>
    );
  }
  return (
    <>
      <p>{coordinateCount}個の座標を選択中</p>
      <AddCellButton
        coordinates={coordinates}
        disabled={coordinateCount === cellCount}
      />
      <DeleteCellButton coordinates={coordinates} />
      <StateSelector {...selection} />
      <SharedStateSelector {...selection} />
      <PlayerCountControl value={selection.maxPlayerCount} />
      <hr />
      <DRMessenger />
    </>
  );
};

const NoSelection = () => (
  <p>
    右クリックで座標を選択してください。Shiftを押しながらクリックで複数選択できます。
  </p>
);

const AddCellButton = ({
  coordinates,
  disabled,
}: {
  disabled?: boolean;
  coordinates: Iterable<DRCellId>;
}) => (
  <SecondaryButton
    icon="add"
    disabled={disabled}
    onClick={useRecoilCallback(
      ({ set }) =>
        () => {
          const added = new Set<DRCellId>();
          for (const cellId of coordinates) {
            set(rcCell(cellId), (c) => {
              if (c) {
                return c;
              }
              added.add(cellId);
              return {
                pending: null,
                state: DRInitialState,
                shared: { state: InitialDRPlayerId, playerCount: 2 },
              };
            });
          }
          if (0 < added.size) {
            set(rcCellList, (current) => new Set([...current, ...added]));
          }
        },
      [coordinates],
    )}
  >
    セルを追加
  </SecondaryButton>
);

const DeleteCellButton = ({
  coordinates,
  disabled,
}: {
  disabled?: boolean;
  coordinates: Iterable<DRCellId>;
}) => (
  <SecondaryButton
    icon="delete"
    disabled={disabled}
    onClick={useRecoilCallback(
      ({ set, reset }) =>
        () => {
          const deleted = new Set<DRCellId>();
          for (const cellId of coordinates) {
            deleted.add(cellId);
            reset(rcCell(cellId));
          }
          if (0 < deleted.size) {
            set(rcCellList, (current) => {
              const filtered = new Set([...current]);
              for (const cellId of deleted) {
                filtered.delete(cellId);
              }
              return filtered;
            });
          }
        },
      [coordinates],
    )}
  >
    セルを削除
  </SecondaryButton>
);

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
      const { get, set } = toSelectorOpts(cbi);
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
