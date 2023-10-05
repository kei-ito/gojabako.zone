'use client';
import { useState } from 'react';
import type { HTMLAttributes } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { classnames } from '../../util/classnames.mts';
import { useRect } from '../use/Rect.mts';
import { DistributedReversiBoard } from './Board';
import { DistributedReversiInfo } from './Info';
import { rcPointerPosition, rcTooltip } from './recoil.mts';
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
