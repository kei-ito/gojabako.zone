import type { ChangeEvent, ReactNode } from 'react';
import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Select } from '../Select';
import { rcLogBuffer, rcLogViewerOptions, rcShowLog } from './recoil.mts';
import * as style from './style.module.scss';
import type {
  DRCoordinate,
  DREventLog,
  DREventLogViewOptions,
} from './util.mts';

export const DistributedReversiLog = () => {
  const showLog = useRecoilValue(rcShowLog);
  const log = useRecoilValue(rcLogBuffer);
  const options = useRecoilValue(rcLogViewerOptions);
  if (!showLog) {
    return null;
  }
  return (
    <section className={style.log}>
      {[...listEventElements(log, options)]}
    </section>
  );
};

const listEventElements = function* (
  list: Array<DREventLog>,
  { time: timeFormat }: DREventLogViewOptions,
): Generator<ReactNode> {
  const first = list[0] as DREventLog | undefined;
  if (!first || first.namespace !== 'game') {
    return;
  }
  const epochMs = Date.parse(first.message);
  const firstMs = first.time;
  const ids = new Set<DRCoordinate>();
  const namespaces = new Set<string>();
  let l = 1;
  for (let i = list.length; i--; ) {
    const s = { gridRow: `${++l} / ${l + 1}` };
    const e = list[i];
    const previous = list[i - 1] as DREventLog | undefined;
    const elapsedMs = previous ? e.time - previous.time : 0;
    const d = new Date(epochMs + e.time - firstMs);
    yield (
      <time key={i + 0.1} dateTime={d.toISOString()} style={s}>
        {timeFormat === 'time' && `${d.toLocaleTimeString()}`}
        {timeFormat === 'diff' && `+${elapsedMs.toFixed(3)}ms`}
      </time>
    );
    ids.add(e.id);
    yield (
      <span key={i + 0.2} style={s}>
        {e.id}
      </span>
    );
    namespaces.add(e.namespace);
    yield (
      <span key={i + 0.3} style={s}>
        {e.namespace}
      </span>
    );
    yield (
      <span key={i + 0.4} className={style.message} style={s}>
        {e.message}
      </span>
    );
  }
  yield <TimeFormatSelector key={'select/timeformat'} />;
};

const TimeFormatSelector = () => {
  const [{ time: timeFormat }, setOptions] = useRecoilState(rcLogViewerOptions);
  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const time = event.currentTarget.value;
      switch (time) {
        case 'time':
        case 'diff':
          setOptions((current) => ({ ...current, time }));
          break;
        default:
      }
    },
    [setOptions],
  );
  return (
    <Select value={timeFormat} onChange={onChange}>
      <option value="time">Time</option>
      <option value="diff">Diff</option>
    </Select>
  );
};
