import type { ChangeEvent } from 'react';
import { useCallback, useEffect } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { clamp } from '../../util/clamp.mts';
import { SecondaryButton } from '../Button';
import { Toggle } from '../Toggle';
import { useFullScreen } from '../use/FullScreen.mts';
import { ZoomSlider } from '../ZoomSlider';
import { DistributedReversiCellInspector } from './CellInspector';
import {
  rcCell,
  rcCellList,
  rcInitCell,
  rcRxDelayMs,
  rcDevMode,
  rcTxDelayMs,
  rcZoom,
} from './recoil.app.mts';
import * as style from './style.module.scss';
import type { DRCellId } from './util.mts';
import { toDRCellId, zoom } from './util.mts';

export const DistributedReversiInfo = () => {
  const devMode = useRecoilValue(rcDevMode);
  return (
    <nav className={style.info}>
      <DistributedReversiCellInspector />
      <InitGameButton />
      <ZoomControl />
      {!devMode && <FullScreenToggle />}
      {devMode && <TxDelayControl />}
      {devMode && <RxDelayControl />}
      <DevModeToggle />
    </nav>
  );
};

const InitGameButton = () => {
  const initCells = useRecoilCallback(
    ({ set, reset, snapshot }) =>
      () => {
        for (const cellId of snapshot.getLoadable(rcCellList).getValue()) {
          set(rcCell(cellId), null);
        }
        reset(rcCellList);
        const list = new Set<DRCellId>();
        const range = 2;
        for (let x = -range; x <= range; x++) {
          for (let y = -range; y <= range; y++) {
            const cellId = toDRCellId(x, y);
            list.add(cellId);
            set(rcInitCell, cellId);
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

const FullScreenToggle = () => {
  const [state, toggle] = useFullScreen(`.${style.container}`);
  const id = 'FullScreen';
  return (
    <section className={style.toggle}>
      <label htmlFor={id}>フルスクリーン</label>
      <Toggle id={id} state={state} onClick={toggle} />
    </section>
  );
};

const DevModeToggle = () => {
  const [devMode, setDevMode] = useRecoilState(rcDevMode);
  const toggle = useCallback(() => setDevMode((s) => !s), [setDevMode]);
  const id = 'CellInspector';
  return (
    <section className={style.toggle}>
      <label htmlFor={id}>開発モード</label>
      <Toggle id={id} state={devMode} onClick={toggle} />
    </section>
  );
};
