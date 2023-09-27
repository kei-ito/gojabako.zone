import type { ChangeEvent } from 'react';
import { useCallback, useEffect } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { SecondaryButton } from '../Button';
import { useOnClickFullScreen } from '../use/OnClickFullScreen.mts';
import { rcCell, rcCellList, rcInitCell, rcZoomLog, zoom } from './recoil.mts';
import * as style from './style.module.scss';
import type { DRCoordinate } from './util.mts';

export const DistributedReversiInfo = () => (
  <nav className={style.info}>
    <InitGameButton />
    <ZoomSlider />
    <FullScreenButton />
  </nav>
);

const InitGameButton = () => {
  const initCells = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        for (const id of snapshot.getLoadable(rcCellList).getValue()) {
          set(rcCell(id), null);
        }
        const list = new Set<DRCoordinate>();
        for (let x = -3; x <= 3; x++) {
          for (let y = -3; y <= 3; y++) {
            const coordinate = `${x},${y}` as const;
            list.add(coordinate);
            set(rcInitCell, coordinate);
          }
        }
        set(rcCellList, list);
      },
    [],
  );
  useEffect(() => initCells(), [initCells]);
  return (
    <SecondaryButton icon="refresh" onClick={initCells}>
      はじめから
    </SecondaryButton>
  );
};

const ZoomSlider = () => {
  const [z, setZoom] = useRecoilState(rcZoomLog);
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setZoom(Number(event.currentTarget.value));
    },
    [setZoom],
  );
  return (
    <input
      type="range"
      min={zoom.logMin}
      max={zoom.logMax}
      value={z}
      onChange={onChange}
      step="0.01"
    />
  );
};

const FullScreenButton = () => {
  const onClick = useOnClickFullScreen(`.${style.container}`);
  return (
    <SecondaryButton icon="fullscreen" onClick={onClick}>
      フルスクリーン
    </SecondaryButton>
  );
};
