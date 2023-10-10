import type { CSSProperties, MouseEvent } from 'react';
import { Fragment, useCallback, useMemo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconClass, classnames } from '../../util/classnames.mts';
import {
  rcCell,
  rcRxBufferLength,
  rcSelectCell,
  rcTxBufferLength,
} from './recoil.app.mts';
import * as style from './style.module.scss';
import { useOnConnection } from './useOnConnection.mts';
import { useOnPressCell } from './useOnPressCell.mts';
import { useRx } from './useRx.mts';
import { useTx } from './useTx.mts';
import type { DRBufferId, DRCell, DRCellId, DRDirection } from './util.mts';
import {
  DRDirections,
  DRInitialState,
  isDRPlayerId,
  toDRBufferId,
} from './util.mts';

interface CellProps {
  cellId: DRCellId;
  debug?: boolean;
}

export const DRCellG = ({ cellId, debug }: CellProps) => {
  return (
    <g
      id={encodeURIComponent(`cell${cellId}`)}
      transform={`translate(${cellId[0]},${-cellId[1]})`}
    >
      <Cell cellId={cellId} debug={debug} />
      {DRDirections.map((d) => {
        const bufferId = toDRBufferId(cellId, d);
        return (
          <Fragment key={d}>
            <Tx bufferId={bufferId} debug={debug} />
            <Rx bufferId={bufferId} debug={debug} />
          </Fragment>
        );
      })}
    </g>
  );
};

const Cell = ({ cellId, debug }: CellProps) => {
  const cell = useRecoilValue(rcCell(cellId));
  const onClick = useOnPressCell(cellId);
  const onContextMenu = useOnContextMenu(cellId);
  const styles = useRectStyles(cell);
  return (
    cell && (
      <>
        <rect
          className={style.cellBackground}
          x="-0.5"
          y="-0.5"
          width="1"
          height="1"
          style={styles.back}
        />
        <rect
          className={classnames(
            style.cell,
            cell.state === DRInitialState && style.initial,
          )}
          x="-0.4"
          y="-0.4"
          rx="0.1"
          ry="0.1"
          width="0.8"
          height="0.8"
          onClick={onClick}
          onContextMenu={onContextMenu}
          style={styles.fore}
        />
        {debug && (
          <text className={style.cellText} x={0} y={0}>
            {cell.state}
            {cell.pending !== null && (
              <>
                <tspan className={IconClass}>double_arrow</tspan>
                {cell.pending}
              </>
            )}
          </text>
        )}
      </>
    )
  );
};

const useRectStyles = (cell: DRCell | null) =>
  useMemo(() => {
    const back: CSSProperties = {};
    const fore: CSSProperties = {};
    const hue = (t: number) => Math.round(360 * t) % 360;
    if (cell) {
      const { state, shared } = cell;
      {
        const h = hue(shared.state / shared.playerCount);
        back.fill = back.stroke = `oklch(100% 0.15 ${h})`;
      }
      if (isDRPlayerId(state)) {
        const h = hue(state / shared.playerCount);
        fore.stroke = fore.fill = `oklch(80% 0.15 ${h})`;
      }
    }
    return { back, fore };
  }, [cell]);

const useOnContextMenu = (cellId: DRCellId) => {
  const selectCell = useSetRecoilState(rcSelectCell);
  return useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      const alt = event.shiftKey || event.metaKey || event.ctrlKey;
      selectCell({ cellId, mode: alt ? 'add' : 'toggle' });
    },
    [cellId, selectCell],
  );
};

interface TxRxProps {
  bufferId: DRBufferId;
  debug?: boolean;
}

const Tx = ({ bufferId, debug }: TxRxProps) => {
  useTx(bufferId);
  useOnConnection(bufferId);
  const d = bufferId[1];
  const bufferedCount = useRecoilValue(rcTxBufferLength(bufferId));
  const [cx, cy] = useArrowPosition(d, -0.2);
  return (
    debug &&
    0 < bufferedCount && (
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
    )
  );
};

const Rx = ({ bufferId, debug }: TxRxProps) => {
  useRx(bufferId);
  const d = bufferId[1];
  const bufferedCount = useRecoilValue(rcRxBufferLength(bufferId));
  const [cx, cy] = useArrowPosition(d, 0.2);
  return (
    debug &&
    0 < bufferedCount && (
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
    )
  );
};

const useArrowPosition = (d: DRDirection, offset: number) =>
  useMemo(() => {
    const r = 0.43;
    const tt = ((getT(d) + offset) * Math.PI) / 2;
    return [r * Math.cos(tt), r * Math.sin(tt)];
  }, [d, offset]);

const getT = (d: DRDirection, offset = 0): 0 | 1 | 2 | 3 =>
  ((({ e: 0, s: 1, w: 2, n: 3 })[d] + offset) % 4) as 0 | 1 | 2 | 3;

const arrowD = ((a: number, b = a / 1.8, c = a / 4) => ({
  0: `m${a / -2.25} 0l${-c} ${b}h${a}l${c} ${-b}l${-c} ${-b}h${-a}z`,
  1: `m0 ${a / -2.25}l${-b} ${-c}v${a}l${b} ${c}l${b} ${-c}v${-a}z`,
  2: `m${a / 2.25} 0l${c} ${b}h${-a}l${-c} ${-b}l${c} ${-b}h${a}z`,
  3: `m0 ${a / 2.25}l${-b} ${c}v${-a}l${b} ${-c}l${b} ${c}v${a}z`,
}))(0.15);
