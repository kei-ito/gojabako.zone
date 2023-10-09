import type { ChangeEvent } from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { SecondaryButton } from '../Button';
import { DRMessenger } from './Messenger';
import type { CellSelection } from './recoil.app.mts';
import {
  rcAddCells,
  rcDeleteCells,
  rcDevMode,
  rcSelectedCells,
  rcSelectedCoordinates,
  rcUpdateSelectedCells,
} from './recoil.app.mts';
import { DRSelector } from './Selector';
import * as style from './style.module.scss';
import type { DRCellId } from './util.mts';
import { DRInitialState, isDRPlayerId } from './util.mts';

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
}) => {
  const addCells = useSetRecoilState(rcAddCells);
  return (
    <SecondaryButton
      icon="add"
      onClick={useCallback(
        () => addCells(coordinates),
        [addCells, coordinates],
      )}
      disabled={disabled}
    >
      セルを追加
    </SecondaryButton>
  );
};

const DeleteCellButton = ({
  coordinates,
  disabled,
}: {
  disabled?: boolean;
  coordinates: Iterable<DRCellId>;
}) => {
  const deleteCells = useSetRecoilState(rcDeleteCells);
  return (
    <SecondaryButton
      icon="delete"
      onClick={useCallback(
        () => deleteCells(coordinates),
        [deleteCells, coordinates],
      )}
      disabled={disabled}
    >
      セルを削除
    </SecondaryButton>
  );
};

const StateSelector = ({ maxPlayerCount }: CellSelection) => {
  const update = useSetRecoilState(rcUpdateSelectedCells);
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
  const update = useSetRecoilState(rcUpdateSelectedCells);
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
  const update = useSetRecoilState(rcUpdateSelectedCells);
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
