'use client';
import { useState } from 'react';
import type { HTMLAttributes } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { classnames } from '../../util/classnames.mts';
import { useRect } from '../use/Rect.mts';
import { DistributedReversiBoard } from './Board';
import { DistributedReversiInfo } from './Info';
import { rcLog, rcPointerPosition, rcShowLog, rcTooltip } from './recoil.mts';
import * as style from './style.module.scss';

export const DistributedReversi = (props: HTMLAttributes<HTMLElement>) => {
  return (
    <RecoilRoot>
      <section
        {...props}
        className={classnames(style.container, props.className)}
      >
        <DistributedReversiBoard />
        <DistributedReversiInfo />
        <Tooltip />
      </section>
      <Log />
    </RecoilRoot>
  );
};

const Tooltip = () => {
  const [div, setDiv] = useState<HTMLElement | null>(null);
  const rect = useRect(div?.parentElement);
  const xy = useRecoilValue(rcPointerPosition);
  const message = useRecoilValue(rcTooltip);
  return (
    <div
      ref={setDiv}
      className={style.tooltip}
      style={
        message && rect
          ? { left: xy[0] - rect.left, top: xy[1] - rect.top + 20 }
          : { display: 'none' }
      }
    >
      {message}
    </div>
  );
};

const Log = () => {
  const showLog = useRecoilValue(rcShowLog);
  const log = useRecoilValue(rcLog);
  if (!showLog) {
    return null;
  }
  return (
    <section className={style.log}>
      {log.map(({ id, date, data }) => (
        <div key={id}>
          {`${date.getHours()}`.padStart(2, '0')}:
          {`${date.getMinutes()}`.padStart(2, '0')}:
          {`${date.getSeconds()}`.padStart(2, '0')}.
          {`${date.getMilliseconds()}`.padStart(3, '0')} {data}
        </div>
      ))}
    </section>
  );
};
