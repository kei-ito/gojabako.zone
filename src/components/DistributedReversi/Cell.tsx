import type { CSSProperties } from 'react';
import { Fragment, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { IconClass, classnames } from '../../util/classnames.mts';
import {
  rcCell,
  rcDirectedRxBuffer,
  rcDirectedTxBuffer,
} from './recoil.app.mts';
import * as style from './style.module.scss';
import { useOnConnection } from './useOnConnection.mts';
import { useOnPressCell } from './useOnPressCell.mts';
import { useRx } from './useRx.mts';
import { useTooltip } from './useTooltip';
import { useTx } from './useTx.mts';
import type { DRCell, DRCellId, DRDirection } from './util.mts';
import { DRDirections, isDRPlayerId, toDRBufferId } from './util.mts';

const r = 0.44;
const toSVGCoodinate = (cellId: DRCellId) => [cellId[0], -cellId[1]] as const;

interface CellProps {
  cellId: DRCellId;
}

export const DistributedReversiCell = ({ cellId }: CellProps) => {
  return (
    <g id={encodeURIComponent(`cell${cellId}`)} className={style.cell}>
      <Cell cellId={cellId} />
      {DRDirections.map((d) => (
        <Fragment key={d}>
          <Tx cellId={cellId} d={d} />
          <Rx cellId={cellId} d={d} />
        </Fragment>
      ))}
    </g>
  );
};

const Cell = ({ cellId }: CellProps) => {
  const cell = useRecoilValue(rcCell(cellId));
  const [x, y] = toSVGCoodinate(cellId);
  const size = 0.9;
  const onClick = useOnPressCell(cellId);
  const tooltipProps = useTooltip(cellId.join(','), cell);
  return (
    cell && (
      <>
        <rect
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          data-state={cell.state}
          onClick={onClick}
          style={getRectStyle(cell)}
          {...tooltipProps}
        />
        <text x={x} y={y}>
          {cell.state}
          {cell.pending !== null && (
            <>
              <tspan className={IconClass}>double_arrow</tspan>
              {cell.pending}
            </>
          )}
        </text>
      </>
    )
  );
};

const getRectStyle = ({ state, shared }: DRCell) => {
  const props: CSSProperties = {};
  {
    const hue = Math.floor((360 * shared.state) / shared.playerCount);
    props.stroke = `hwb(${hue} 0% 25%)`;
  }
  if (isDRPlayerId(state)) {
    const hue = (360 * state) / shared.playerCount;
    props.fill = `hwb(${hue} 75% 0%)`;
  }
  return props;
};

interface TxRxProps {
  cellId: DRCellId;
  d: DRDirection;
}

const Tx = ({ cellId, d }: TxRxProps) => {
  useTx(toDRBufferId(cellId, d));
  useOnConnection(cellId, d);
  const buffer = useRecoilValue(rcDirectedTxBuffer(toDRBufferId(cellId, d)));
  const [cx, cy] = useMemo(() => {
    const tt = ((getT(d) - 0.2) * Math.PI) / 2;
    const [x, y] = toSVGCoodinate(cellId);
    return [x + r * Math.cos(tt), y + r * Math.sin(tt)];
  }, [cellId, d]);
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
      />
      <text x={cx} y={cy} className={style.buffer}>
        {bufferedCount}
      </text>
    </>
  );
};

const Rx = ({ cellId, d }: TxRxProps) => {
  useRx(toDRBufferId(cellId, d));
  const buffer = useRecoilValue(rcDirectedRxBuffer(toDRBufferId(cellId, d)));
  const [cx, cy] = useMemo(() => {
    const tt = ((getT(d) + 0.2) * Math.PI) / 2;
    const [x, y] = toSVGCoodinate(cellId);
    return [x + r * Math.cos(tt), y + r * Math.sin(tt)];
  }, [cellId, d]);
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
      />
      <text x={cx} y={cy} className={style.buffer}>
        {bufferedCount}
      </text>
    </>
  );
};

const getT = (d: DRDirection, offset = 0): 0 | 1 | 2 | 3 =>
  ((({ e: 0, s: 1, w: 2, n: 3 })[d] + offset) % 4) as 0 | 1 | 2 | 3;

const arrowD = ((a: number, b = a / 1.8, c = a / 4) => ({
  0: `m${a / -2.25} 0l${-c} ${b}h${a}l${c} ${-b}l${-c} ${-b}h${-a}z`,
  1: `m0 ${a / -2.25}l${-b} ${-c}v${a}l${b} ${c}l${b} ${-c}v${-a}z`,
  2: `m${a / 2.25} 0l${c} ${b}h${-a}l${-c} ${-b}l${c} ${-b}h${a}z`,
  3: `m0 ${a / 2.25}l${-b} ${c}v${-a}l${b} ${-c}l${b} ${c}v${a}z`,
}))(0.15);
