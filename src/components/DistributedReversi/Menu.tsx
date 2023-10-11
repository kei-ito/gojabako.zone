import type { ChangeEvent } from 'react';
import { useCallback } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { clamp } from '../../util/clamp.mts';
import { toRecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { SecondaryButton } from '../Button';
import { Toggle } from '../Toggle';
import { useFullScreen } from '../use/FullScreen.mts';
import { ZoomSlider } from '../ZoomSlider';
import { DRCellInspector } from './CellInspector';
import {
  rcCell,
  rcCellList,
  rcAppMode,
  rcRxDelayMs,
  rcTxDelayMs,
  rcZoom,
  rcSelectedCoordinates,
} from './recoil.app.mts';
import { DRSelector } from './Selector';
import * as style from './style.module.scss';
import type { DRAppMode } from './util.mts';
import { DRInitialState, InitialDRPlayerId, zoom } from './util.mts';

export const DRMenu = () => (
  <nav className={style.info}>
    <AppModeSelector />
    <DRCellInspector />
    <div className={style.spacer} />
    <InitGameButton />
    <ZoomControl />
    <FullScreenToggle />
    <TxDelayControl />
    <RxDelayControl />
  </nav>
);

const InitGameButton = () => (
  <SecondaryButton
    icon="refresh"
    onClick={useRecoilCallback(
      (cbi) => () => {
        const { get, set } = toRecoilSelectorOpts(cbi);
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

const AppModeSelector = () => {
  const appMode = useRecoilValue(rcAppMode);
  const descriptions: Record<DRAppMode, string> = {
    play: 'クリックでセルの状態を変更します。',
    edit: 'セルがなければ作成し、あれば削除します。',
    debug: 'クリックでセルを選択します。Shiftキーで複数選択できます。',
  };
  return (
    <>
      <DRSelector<DRAppMode>
        id="AppMode"
        label="クリック操作"
        values={['play', 'edit', 'debug']}
        defaultValue={appMode}
        onChange={useRecoilCallback(
          ({ set, reset }) =>
            (value) => {
              set(rcAppMode, value as DRAppMode);
              reset(rcSelectedCoordinates);
            },
          [],
        )}
      />
      {<p>{descriptions[appMode]}</p>}
    </>
  );
};
