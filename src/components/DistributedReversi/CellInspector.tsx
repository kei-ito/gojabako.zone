import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { rcSelectedCells, rcShowInspector } from './recoil.app.mts';
import * as style from './style.module.scss';

export const DistributedReversiCellInspector = () => {
  const active = useRecoilValue(rcShowInspector);
  const [selectedCells, setSelectedCells] = useRecoilState(rcSelectedCells);
  useEffect(
    () => () => setSelectedCells(new Set()),
    [setSelectedCells, active],
  );
  if (!active) {
    return <div className={style.inspector} />;
  }
  const { size } = selectedCells;
  if (size === 0) {
    return (
      <div className={style.inspector}>
        右クリックで座標を選択してください。Shiftを押しながらクリックで複数選択できます。
      </div>
    );
  }
  return (
    <>
      <div>{size}個の座標を選択中</div>
      <div className={style.inspector}></div>
    </>
  );
};
