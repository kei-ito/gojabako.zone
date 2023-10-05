import type { ChangeEvent } from 'react';
import { useCallback, useEffect } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { clamp } from '../../util/clamp.mts';
import { SecondaryButton } from '../Button';
import { useOnClickFullScreen } from '../use/OnClickFullScreen.mts';
import { ZoomSlider } from '../ZoomSlider';
import {
  rcCell,
  rcCellList,
  rcInitCell,
  rcRxDelayMs,
  rcTxDelayMs,
  rcZoom,
  zoom,
} from './recoil.mts';
import * as style from './style.module.scss';
import type { DRCoordinate } from './util.mts';

export const DistributedReversiInfo = () => (
  <nav className={style.info}>
    <InitGameButton />
    <ZoomControl />
    <TxDelayControl />
    <RxDelayControl />
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
        const list = new Set<DRCoordinate>();
        const range = 1;
        for (let x = -range; x <= range; x++) {
          for (let y = -range; y <= range; y++) {
            const coordinate = `${x},${y}` as const;
            list.add(coordinate);
            set(rcInitCell, coordinate);
          }
        }
        setTimeout(() => set(rcCellList, list), 50);
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

const TxDelayControl = () => {
  const [ms, setMs] = useRecoilState(rcTxDelayMs);
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setMs(clamp(Math.round(Number(event.currentTarget.value)), 0, 5000));
    },
    [setMs],
  );
  const id = 'TxDelayMs';
  return (
    <section className={style.number}>
      <label htmlFor={id}>送信遅延</label>
      <input id={id} type="number" step={10} value={ms} onChange={onChange} />
      <span>ms</span>
    </section>
  );
};

const RxDelayControl = () => {
  const [ms, setMs] = useRecoilState(rcRxDelayMs);
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setMs(clamp(Math.round(Number(event.currentTarget.value)), 0, 5000));
    },
    [setMs],
  );
  const id = 'RxDelayMs';
  return (
    <section className={style.number}>
      <label htmlFor={id}>受信遅延</label>
      <input id={id} type="number" step={10} value={ms} onChange={onChange} />
      <span>ms</span>
    </section>
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
