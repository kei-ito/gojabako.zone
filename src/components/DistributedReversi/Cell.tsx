import type { MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { classnames } from '../../util/classnames.mts';
import { useOnClickLog } from '../use/OnClickLog.mts';
import { rcCell } from './recoil.mts';
import * as style from './style.module.scss';
import { useTx } from './useTx.mts';
import type { DRCoordinate, DRDirection, DRMessageSetShared } from './util.mts';
import {
  allTxAndCoordinates,
  getAdjecentId,
  nextOwnerId,
  parseDRCoordinate,
} from './util.mts';

const r = 0.44;

interface DistributedReversiCellProps {
  id: DRCoordinate;
}

export const DistributedReversiCell = ({ id }: DistributedReversiCellProps) => (
  <g id={encodeURIComponent(`cell${id}`)} className={style.cell}>
    <Cell id={id} />
    <Tx id={id} d="l" />
    <Tx id={id} d="t" />
    <Tx id={id} d="r" />
    <Tx id={id} d="b" />
    <Rx id={id} d="l" />
    <Rx id={id} d="t" />
    <Rx id={id} d="r" />
    <Rx id={id} d="b" />
  </g>
);

const Cell = ({ id }: DistributedReversiCellProps) => {
  const { state, sharedState, pending } = useRecoilValue(rcCell(id)) ?? {};
  const onClick = useOnClick(id);
  const [x, y] = parseDRCoordinate(id);
  const size = 0.9;
  const round = 0.1;
  const lineHeight = 0.12;
  useTx(id);
  return (
    <>
      <rect
        x={x - size / 2}
        y={y - size / 2}
        rx={round}
        ry={round}
        width={size}
        height={size}
        data-state={state}
        onClick={onClick}
      />
      <text x={x} y={y - lineHeight}>
        {state}
        {pending === null ? null : ` ${pending}?`}
      </text>
      <text x={x} y={y + lineHeight}>
        {sharedState}
      </text>
    </>
  );
};

const useOnClick = (id: DRCoordinate) =>
  useRecoilCallback(
    ({ set }) =>
      (event: MouseEvent) => {
        event.stopPropagation();
        set(rcCell(id), (cell) => {
          const sharedState = cell?.sharedState;
          if (!cell || !sharedState || sharedState === 'initial') {
            return cell;
          }
          cell = { ...cell };
          for (const [d, to] of allTxAndCoordinates(id)) {
            cell[d] = [
              ...cell[d],
              { type: 'press', from: id, to, at: id, state: sharedState },
            ];
          }
          return {
            ...cell,
            state: sharedState,
            sharedState: nextOwnerId(sharedState),
          };
        });
      },
    [id],
  );

interface TxProps extends DistributedReversiCellProps {
  d: DRDirection;
}

const Tx = ({ id, d }: TxProps) => {
  const [sent, setSent] = useState(false);
  const [cell, setCell] = useRecoilState(rcCell(id));
  useEffect(() => {
    if (!sent) {
      setCell((c) => {
        if (!c) {
          return c;
        }
        const msg: DRMessageSetShared = {
          type: 'setShared',
          from: id,
          to: getAdjecentId(id, d),
          state: c.sharedState,
        };
        const k = `tx${d}` as const;
        return { ...c, [k]: [...c[k], msg] };
      });
      setSent(true);
    }
  }, [sent, id, setCell, d]);
  const [cx, cy] = useMemo(() => {
    const tt = ((getT(d) - 0.2) * Math.PI) / 2;
    const [x, y] = parseDRCoordinate(id);
    return [x + r * Math.cos(tt), y + r * Math.sin(tt)];
  }, [id, d]);
  const onClick = useOnClickLog(cell?.[`tx${d}`]);
  if (!cell) {
    return null;
  }
  const bufferedCount = cell[`tx${d}`].length;
  return (
    <>
      <path
        d={`M${cx.toFixed(3)} ${cy.toFixed(3)}${arrowD[getT(d)]}`}
        className={classnames(style.handle, 0 < bufferedCount && style.active)}
        onClick={onClick}
      />
      <text x={cx} y={cy} className={style.buffer}>
        {bufferedCount}
      </text>
    </>
  );
};

const Rx = ({ id, d }: TxProps) => {
  const cell = useRecoilValue(rcCell(id));
  const [cx, cy] = useMemo(() => {
    const tt = ((getT(d) + 0.2) * Math.PI) / 2;
    const [x, y] = parseDRCoordinate(id);
    return [x + r * Math.cos(tt), y + r * Math.sin(tt)];
  }, [id, d]);
  const onClick = useOnClickLog(cell?.[`rx${d}`]);
  if (!cell) {
    return null;
  }
  const bufferedCount = cell[`rx${d}`].length;
  return (
    <>
      <path
        d={`M${cx.toFixed(3)} ${cy.toFixed(3)}${arrowD[getT(d, 2)]}`}
        className={classnames(style.handle, 0 < bufferedCount && style.active)}
        onClick={onClick}
      />
      <text x={cx} y={cy} className={style.buffer}>
        {bufferedCount}
      </text>
    </>
  );
};

const getT = (d: DRDirection, offset = 0): 0 | 1 | 2 | 3 =>
  ((({ r: 0, b: 1, l: 2, t: 3 })[d] + offset) % 4) as 0 | 1 | 2 | 3;

const arrowD = ((a: number, b = a / 1.8, c = a / 4) => ({
  0: `m${a / -2.25} 0l${-c} ${b}h${a}l${c} ${-b}l${-c} ${-b}h${-a}z`,
  1: `m0 ${a / -2.25}l${-b} ${-c}v${a}l${b} ${c}l${b} ${-c}v${-a}z`,
  2: `m${a / 2.25} 0l${c} ${b}h${-a}l${-c} ${-b}l${c} ${-b}h${a}z`,
  3: `m0 ${a / 2.25}l${-b} ${c}v${-a}l${b} ${-c}l${b} ${c}v${a}z`,
}))(0.15);
