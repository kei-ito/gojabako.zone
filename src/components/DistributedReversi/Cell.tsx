import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { classnames } from '../../util/classnames.mts';
import { rcCell, rcMessageBuffer } from './recoil.mts';
import * as style from './style.module.scss';
import { useOnClickCell } from './useOnClickCell.mts';
import { useOnConnection } from './useOnConnection.mts';
import { useRx } from './useRx.mts';
import { useTooltip } from './useTooltip';
import { useTx } from './useTx.mts';
import type { DRCell, DRCoordinate, DRDirection } from './util.mts';
import { parseDRCoordinate } from './util.mts';

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
  const cell: Partial<DRCell> = useRecoilValue(rcCell(id)) ?? {};
  const [x, y] = parseDRCoordinate(id);
  const size = 0.9;
  const round = 0.1;
  const lineHeight = 0.12;
  return (
    <>
      <rect
        x={x - size / 2}
        y={y - size / 2}
        rx={round}
        ry={round}
        width={size}
        height={size}
        data-state={cell.state}
        onClick={useOnClickCell(id)}
        {...useTooltip(id, cell)}
      />
      <text x={x} y={y - lineHeight}>
        {cell.state}
        {cell.pending === null ? null : ` ${cell.pending}?`}
      </text>
      <text x={x} y={y + lineHeight}>
        {cell.sharedState}
      </text>
    </>
  );
};

interface TxProps extends DistributedReversiCellProps {
  d: DRDirection;
}

const Tx = ({ id, d }: TxProps) => {
  useTx(id, d);
  useOnConnection(id, d);
  const buffer = useRecoilValue(rcMessageBuffer(`${id},tx${d}`));
  const [cx, cy] = useMemo(() => {
    const tt = ((getT(d) - 0.2) * Math.PI) / 2;
    const [x, y] = parseDRCoordinate(id);
    return [x + r * Math.cos(tt), y + r * Math.sin(tt)];
  }, [id, d]);
  const bufferedCount = buffer.length;
  return (
    <>
      <path
        d={`M${cx.toFixed(3)} ${cy.toFixed(3)}${arrowD[getT(d)]}`}
        className={classnames(
          style.buffer,
          style.tx,
          0 < bufferedCount && style.active,
        )}
        {...useTooltip(`Tx${d}:${id}`, 0 < buffer.length ? buffer : null)}
      />
      <text x={cx} y={cy} className={style.buffer}>
        {bufferedCount}
      </text>
    </>
  );
};

const Rx = ({ id, d }: TxProps) => {
  useRx(id, d);
  const buffer = useRecoilValue(rcMessageBuffer(`${id},rx${d}`));
  const [cx, cy] = useMemo(() => {
    const tt = ((getT(d) + 0.2) * Math.PI) / 2;
    const [x, y] = parseDRCoordinate(id);
    return [x + r * Math.cos(tt), y + r * Math.sin(tt)];
  }, [id, d]);
  const bufferedCount = buffer.length;
  return (
    <>
      <path
        d={`M${cx.toFixed(3)} ${cy.toFixed(3)}${arrowD[getT(d, 2)]}`}
        className={classnames(
          style.buffer,
          style.rx,
          0 < bufferedCount && style.active,
        )}
        {...useTooltip(`Rx${d}:${id}`, 0 < buffer.length ? buffer : null)}
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
