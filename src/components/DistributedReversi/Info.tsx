import type { ChangeEvent } from 'react';
import { useCallback } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { clamp } from '../../util/clamp.mts';
import { toSelectorOpts } from '../../util/recoil/selector.mts';
import { SecondaryButton } from '../Button';
import { Toggle } from '../Toggle';
import { useFullScreen } from '../use/FullScreen.mts';
import { ZoomSlider } from '../ZoomSlider';
import { DRCellInspector } from './CellInspector';
import {
  rcCell,
  rcCellList,
  rcDevMode,
  rcRxDelayMs,
  rcTxDelayMs,
  rcZoom,
} from './recoil.app.mts';
import * as style from './style.module.scss';
import { DRInitialState, InitialDRPlayerId, zoom } from './util.mts';

export const DRInfo = () => {
  const devMode = useRecoilValue(rcDevMode);
  return (
    <nav className={style.info}>
      <DRCellInspector />
      <div className={style.spacer} />
      <InitGameButton />
      <ZoomControl />
      {!devMode && <FullScreenToggle />}
      {devMode && <TxDelayControl />}
      {devMode && <RxDelayControl />}
      <DevModeToggle />
    </nav>
  );
};

const InitGameButton = () => (
  <SecondaryButton
    icon="refresh"
    onClick={useRecoilCallback(
      (cbi) => () => {
        const { get, set } = toSelectorOpts(cbi);
        for (const cellId of get(rcCellList)) {
          set(rcCell(cellId), (cell) => ({
            shared: { state: InitialDRPlayerId, playerCount: 2 },
            ...cell,
            pending: null,
            state: DRInitialState,
          }));
        }
      },
      [],
    )}
  >
    はじめから
  </SecondaryButton>
);

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
      <label htmlFor={id}>送信遅延 [ms]</label>
      <input id={id} type="number" step={10} value={ms} onChange={onChange} />
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
      <label htmlFor={id}>受信遅延 [ms]</label>
      <input id={id} type="number" step={10} value={ms} onChange={onChange} />
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
