'use client';
import { useSearchParams } from 'next/navigation';
import type { HTMLAttributes } from 'react';
import { RecoilRoot } from 'recoil';
import { classnames } from '../../util/classnames.mts';
import { getCurrentUrl } from '../../util/getCurrentUrl.mts';
import { DRBoard } from './Board';
import { DRFloater } from './Floater';
import { DRInfo } from './Info';
import * as style from './style.module.scss';

export const DistributedReversi = (props: HTMLAttributes<HTMLElement>) => {
  getCurrentUrl.defaultSearchParams = useSearchParams();
  return (
    <section
      {...props}
      className={classnames(style.container, props.className)}
    >
      <RecoilRoot>
        <DRBoard />
        <DRInfo />
        <DRFloater />
      </RecoilRoot>
    </section>
  );
};
