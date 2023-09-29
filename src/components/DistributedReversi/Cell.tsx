import type { MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { classnames } from '../../util/classnames.mts';
import { noop } from '../../util/noop.mts';
import { rcCell, rcSendMessage } from './recoil.mts';
import * as style from './style.module.scss';
import { listDRAdjacents, parseDRCoordinate } from './util.mts';
import type { DRCoordinate } from './util.mts';

interface DistributedReversiCellProps {
  id: DRCoordinate;
}

export const DistributedReversiCell = ({ id }: DistributedReversiCellProps) => (
  <g id={encodeURIComponent(`cell${id}`)} className={style.cell}>
    <Cell id={id} />
    <Tx id={id} t={0} />
    <Tx id={id} t={1} />
    <Tx id={id} t={2} />
    <Tx id={id} t={3} />
  </g>
);

const Cell = ({ id }: DistributedReversiCellProps) => {
  const { state, sharedState } = useRecoilValue(rcCell(id)) ?? {};
  const onClick = useOnClick(id);
  const [x, y] = parseDRCoordinate(id);
  const size = 0.9;
  const r = 0.1;
  const lineHeight = 0.12;
  return (
    <>
      <rect
        x={x - size / 2}
        y={y - size / 2}
        rx={r}
        ry={r}
        width={size}
        height={size}
        data-state={state}
        onClick={onClick}
      />
      <text x={x} y={y - lineHeight}>
        {state}
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
          if (!cell || cell.sharedState === 'initial') {
            return cell;
          }
          for (const to of listDRAdjacents(id)) {
            set(rcSendMessage, {
              from: id,
              to,
              type: 'test',
              state: cell.sharedState,
            });
          }
          return { ...cell, state: cell.sharedState };
        });
      },
    [id],
  );

interface TxProps extends DistributedReversiCellProps {
  /** 0:R 1:B 2:L 3:T */
  t: 0 | 1 | 2 | 3;
}

// eslint-disable-next-line max-lines-per-function
const Tx = ({ id, t }: TxProps) => {
  const [sent, setSent] = useState(false);
  const cell = useRecoilValue(rcCell(id));
  const nextId = useNextId(id, t);
  const send = useSetRecoilState(rcSendMessage);
  const next = useRecoilValue(rcCell(nextId));
  const buffer = next ? next[(['rxl', 'rxt', 'rxr', 'rxb'] as const)[t]] : null;
  const [cx, cy] = useMemo(() => {
    const r = 0.48;
    const tt = ((t - 0.2) * Math.PI) / 2;
    const [x, y] = parseDRCoordinate(id);
    return [x + r * Math.cos(tt), y + r * Math.sin(tt)];
  }, [id, t]);
  useEffect(() => {
    if (sent || !next || !cell) {
      return noop;
    }
    const timerId = setTimeout(
      () => {
        send({
          from: id,
          to: nextId,
          type: 'setShared',
          state: cell.sharedState,
        });
        setSent(true);
      },
      50 + 100 * Math.random(),
    );
    return () => clearTimeout(timerId);
  }, [sent, id, nextId, cell, next, send]);
  const onClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      // eslint-disable-next-line no-alert
      alert(JSON.stringify(buffer));
    },
    [buffer],
  );
  if (!next || !buffer) {
    return null;
  }
  return (
    <>
      <path
        d={`M${cx.toFixed(3)} ${cy.toFixed(3)}${arrowD[t]}`}
        className={classnames(style.handle, 0 < buffer.length && style.active)}
        onClick={onClick}
      />
      <text x={cx} y={cy} className={style.buffer}>
        {buffer.length}
      </text>
    </>
  );
};

const arrowD = ((a: number, b = a * 1.73) => ({
  /** R */
  0: `m${a / -2} 0v${a}l${b} ${-a}l${-b} ${-a}z`,
  /** B */
  1: `m0 ${a / -2}h${-a}l${a} ${b}l${a} ${-b}z`,
  /** L */
  2: `m${a / 2} 0v${a}l${-b} ${-a}l${b} ${-a}z`,
  /** T */
  3: `m0 ${a / 2}h${-a}l${a} ${-b}l${a} ${b}z`,
}))(0.1);

const useNextId = (id: DRCoordinate, t: 0 | 1 | 2 | 3) =>
  useMemo<DRCoordinate>(() => {
    const [x, y] = parseDRCoordinate(id);
    switch (t) {
      case 0:
        return `${x + 1},${y}`;
      case 1:
        return `${x},${y + 1}`;
      case 2:
        return `${x - 1},${y}`;
      case 3:
      default:
        return `${x},${y - 1}`;
    }
  }, [id, t]);
