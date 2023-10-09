'use client';
import { useSearchParams } from 'next/navigation';
import type { HTMLAttributes } from 'react';
import { useCallback } from 'react';
import type { MutableSnapshot } from 'recoil';
import { RecoilRoot } from 'recoil';
import { classnames } from '../../util/classnames.mts';
import { getCurrentUrl } from '../../util/getCurrentUrl.mts';
import { DRBoard } from './Board';
import { DRFloater } from './Floater';
import { DRInfo } from './Info';
import { rcAddCells } from './recoil.app.mts';
import * as style from './style.module.scss';
import type { DRCellId } from './util.mts';
import { toDRCellId } from './util.mts';

export const DistributedReversi = (props: HTMLAttributes<HTMLElement>) => {
  getCurrentUrl.defaultSearchParams = useSearchParams();
  return (
    <section
      {...props}
      className={classnames(style.container, props.className)}
    >
      <RecoilRoot initializeState={useInit()}>
        <DRBoard />
        <DRInfo />
        <DRFloater />
      </RecoilRoot>
    </section>
  );
};

const useInit = () =>
  useCallback(({ set }: MutableSnapshot) => {
    const size = 2;
    const coordinates: Array<DRCellId> = [];
    for (let x = -size; x <= size; x++) {
      for (let y = -size; y <= size; y++) {
        coordinates.push(toDRCellId(x, y));
      }
    }
    set(rcAddCells, coordinates);
  }, []);
