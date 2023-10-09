'use client';
import { useSearchParams } from 'next/navigation';
import type { HTMLAttributes } from 'react';
import { RecoilRoot } from 'recoil';
import { classnames } from '../../util/classnames.mts';
import { getCurrentUrl } from '../../util/getCurrentUrl.mts';
import { DistributedReversiBoard } from './Board';
import { DistributedReversiFloater } from './Floater';
import { DistributedReversiInfo } from './Info';
import * as style from './style.module.scss';

export const DistributedReversi = (props: HTMLAttributes<HTMLElement>) => {
  getCurrentUrl.defaultSearchParams = useSearchParams();
  return (
    <section
      {...props}
      className={classnames(style.container, props.className)}
    >
      <RecoilRoot>
        <DistributedReversiBoard />
        <DistributedReversiInfo />
        <DistributedReversiFloater />
      </RecoilRoot>
    </section>
  );
};
