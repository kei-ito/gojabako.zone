import type { MouseEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { toRecoilSelectorOpts } from '../../util/recoil/selector.mts';
import { useRect } from '../use/Rect.mts';
import { DRCellG } from './Cell';
import type { XYWHZ } from './recoil.app.mts';
import {
  rcAppMode,
  rcCell,
  rcCellList,
  rcDragging,
  rcPointerPosition,
  rcPointeredCell,
  rcSelectedCoordinates,
  rcViewBox,
  rcXYWHZ,
  selectCoordinates,
} from './recoil.app.mts';
import * as style from './style.module.scss';
import type { DRCellId } from './util.mts';
import { defaultDRCell } from './util.mts';

export const DRBoard = () => {
  const [element, setElement] = useState<Element | null>(null);
  useSyncRect(element);
  useSyncPointerPosition(element as HTMLElement);
  useGrab(element as HTMLElement);
  return (
    <svg
      ref={setElement}
      className={style.board}
      viewBox={useRecoilValue(rcViewBox)}
      onClick={useOnClick()}
    >
      <Cells />
      <SelectedCoordinates />
      <PointeredCell />
    </svg>
  );
};

const useOnClick = () =>
  useRecoilCallback(
    (cbi) => () => {
      const { get, reset } = toRecoilSelectorOpts(cbi);
      if (get(rcDragging)) {
        return;
      }
      reset(rcSelectedCoordinates);
    },
    [],
  );

const PointeredCell = () => {
  const cellId = useRecoilValue(rcPointeredCell);
  const dragging = useRecoilValue(rcDragging);
  const onClick = useOnClickPointeredCell(cellId);
  const appMode = useRecoilValue(rcAppMode);
  const list = useRecoilValue(rcCellList);
  if (appMode === 'play' || !cellId || dragging) {
    return null;
  }
  return (
    <g
      className={style.pointered}
      transform={`translate(${cellId[0]},${-cellId[1]})`}
    >
      <rect x="-0.5" y="-0.5" width="1" height="1" onClick={onClick} />
      {appMode === 'edit' && (
        <path
          d={
            list.has(cellId)
              ? 'M-0.2 -0.2L0.2 0.2M-0.2 0.2L0.2 -0.2'
              : 'M-0.2 0H0.2M0 -0.2V0.2'
          }
        />
      )}
    </g>
  );
};

const useOnClickPointeredCell = (cellId: DRCellId | null) =>
  useRecoilCallback(
    (cbi) => (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!cellId) {
        return;
      }
      const { get, set } = toRecoilSelectorOpts(cbi);
      const alt = event.shiftKey || event.metaKey || event.ctrlKey;
      switch (get(rcAppMode)) {
        case 'debug':
          set(
            rcSelectedCoordinates,
            selectCoordinates(cellId, alt ? 'add' : 'toggle'),
          );
          break;
        case 'edit':
          if (get(rcCell(cellId))) {
            set(rcCell(cellId), null);
            set(rcCellList, (current) => {
              const newSet = new Set(current);
              newSet.delete(cellId);
              return newSet;
            });
          } else {
            set(rcCell(cellId), defaultDRCell());
            set(rcCellList, (current) => {
              const newSet = new Set(current);
              newSet.add(cellId);
              return newSet;
            });
          }
          break;
        default:
      }
    },
    [cellId],
  );

const Cells = () => {
  const cells = useRecoilValue(rcCellList);
  return [
    ...(function* (): Generator<ReactNode> {
      for (const cellId of cells) {
        yield <DRCellG key={cellId.join(',')} cellId={cellId} />;
      }
    })(),
  ];
};

const SelectedCoordinates = () => {
  const selectedCells = useRecoilValue(rcSelectedCoordinates);
  return [
    ...(function* (): Generator<ReactNode> {
      for (const [x, y] of selectedCells) {
        yield (
          <circle
            key={`selected ${x} ${y}`}
            className={style.selected}
            cx={x}
            cy={-y}
            r="0.5"
          />
        );
      }
    })(),
  ];
};

const useSyncPointerPosition = (board: HTMLElement | null) => {
  const setPosition = useSetRecoilState(rcPointerPosition);
  useEffect(() => {
    const abc = new AbortController();
    if (board) {
      board.addEventListener(
        'pointermove',
        (e) => setPosition([e.offsetX, e.offsetY]),
        { signal: abc.signal },
      );
      board.addEventListener('pointerleave', () => setPosition(null), {
        signal: abc.signal,
      });
    }
    return () => abc.abort();
  }, [board, setPosition]);
};

const useSyncRect = (board: Element | null) => {
  const [lastRect, setLastRect] = useState<DOMRect | null>(null);
  const rect = useRect(board);
  const setXYZ = useSetRecoilState(rcXYWHZ);
  useEffect(
    () => {
      if (!rect) {
        return;
      }
      const { width: w, height: h } = rect;
      if (lastRect) {
        const dx = rect.width - lastRect.width;
        const dy = rect.height - lastRect.height;
        if (dx === 0 && dy === 0) {
          return;
        }
        setXYZ(([x, y, _w, _h, z]) => {
          return [x - dx / z / 2, y - dy / z / 2, w / z, h / z, z];
        });
      } else {
        setXYZ(([_x, _y, _w, _h, z]) => {
          return [rect.width / -2 / z, rect.height / -2 / z, w / z, h / z, z];
        });
      }
      setLastRect(rect);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rect, setXYZ],
  );
};

// const useWheel = (board: HTMLElement | null) => {
//   const setZoom = useSetRecoilState(rcZoom);
//   useEffect(() => {
//     if (!board) {
//       return noop;
//     }
//     const abc = new AbortController();
//     board.addEventListener(
//       'wheel',
//       (event: WheelEvent) => {
//         event.preventDefault();
//         setZoom(({ z }) => {
//           const rect = board.getBoundingClientRect();
//           const cx = (event.clientX - rect.left) / rect.width;
//           const cy = (event.clientY - rect.top) / rect.height;
//           const rz = 1 - event.deltaY / 300;
//           return { z: z * rz, cx, cy };
//         });
//       },
//       { passive: false, signal: abc.signal },
//     );
//     return () => abc.abort();
//   }, [board, setZoom]);
// };

const useGrab = (board: HTMLElement | null) => {
  const onPointerDown = useOnPointerDown();
  useEffect(() => {
    const abc = new AbortController();
    board?.addEventListener('pointerdown', onPointerDown, {
      signal: abc.signal,
    });
    return () => abc.abort();
  }, [board, onPointerDown]);
};

const useOnPointerDown = () =>
  useRecoilCallback(({ set, snapshot }) => (e0: PointerEvent) => {
    if (e0.button !== 0 || snapshot.getLoadable(rcDragging).getValue()) {
      return;
    }
    const target = e0.target as HTMLElement;
    target.setPointerCapture(e0.pointerId);
    const abc = new AbortController();
    const diff = (e: PointerEvent): [number, number] => [
      e.clientX - e0.clientX,
      e.clientY - e0.clientY,
    ];
    const anchor = snapshot.getLoadable(rcXYWHZ).getValue();
    const onMove = (e: PointerEvent) => {
      if (e.pointerId === e0.pointerId) {
        set(rcDragging, abc);
        const newXYWHZ: XYWHZ = [...anchor];
        newXYWHZ[5] = diff(e);
        set(rcXYWHZ, newXYWHZ);
      }
    };
    const onUp = (e: PointerEvent) => {
      target.releasePointerCapture(e0.pointerId);
      abc.abort();
      const [x, y, w, h, z] = anchor;
      const d = diff(e);
      set(rcXYWHZ, [x - d[0] / z, y - d[1] / z, w, h, z]);
      setTimeout(() => set(rcDragging, null), 50);
    };
    target.addEventListener('pointermove', onMove, { signal: abc.signal });
    target.addEventListener('pointerup', onUp, { signal: abc.signal });
  });
