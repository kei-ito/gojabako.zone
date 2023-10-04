import { useCallback, useEffect } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { SecondaryButton } from '../Button';
import { useOnClickFullScreen } from '../use/OnClickFullScreen.mts';
import { ZoomSlider } from '../ZoomSlider';
import { rcCell, rcCellList, rcInitCell, rcZoom, zoom } from './recoil.mts';
import * as style from './style.module.scss';
import type { DRCoordinate } from './util.mts';

export const DistributedReversiInfo = () => (
  <nav className={style.info}>
    <InitGameButton />
    <ZoomControl />
    <FullScreenButton />
  </nav>
);

const InitGameButton = () => {
  const initCells = useRecoilCallback(
    ({ set, reset, snapshot }) =>
      () => {
        for (const id of snapshot.getLoadable(rcCellList).getValue()) {
          set(rcCell(id), null);
        }
        reset(rcCellList);
        setTimeout(() => {
          const list = new Set<DRCoordinate>();
          for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
              const coordinate = `${x},${y}` as const;
              list.add(coordinate);
              set(rcInitCell, coordinate);
            }
          }
          set(rcCellList, list);
        }, 100);
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

const ZoomControl = () => {
  const [{ z: value }, setZoom] = useRecoilState(rcZoom);
  const onChangeValue = useCallback((z: number) => setZoom({ z }), [setZoom]);
  return (
    <ZoomSlider
      value={value}
      min={zoom.min}
      max={zoom.max}
      onChangeValue={onChangeValue}
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
