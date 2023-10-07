'use client';
import type { HTMLAttributes } from 'react';
import { RecoilRoot } from 'recoil';
import { classnames } from '../../util/classnames.mts';
import { DistributedReversiBoard } from './Board';
import { DistributedReversiInfo } from './Info';
import * as style from './style.module.scss';
import { DistributedReversiTooltip } from './Tooltip';

export const DistributedReversi = (props: HTMLAttributes<HTMLElement>) => {
  return (
    <RecoilRoot>
      <section
        {...props}
        className={classnames(style.container, props.className)}
      >
        <DistributedReversiBoard />
        <DistributedReversiInfo />
        <DistributedReversiTooltip />
      </section>
    </RecoilRoot>
  );
};
