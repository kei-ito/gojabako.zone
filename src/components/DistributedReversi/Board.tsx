import type { MouseEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { toSelectorOpts } from '../../util/recoil/selector.mts';
import { useRect } from '../use/Rect.mts';
import { DRCellG } from './Cell';
import type { XYWHZ } from './recoil.app.mts';
import {
  rcCell,
  rcCellList,
  rcDevMode,
  rcDragging,
  rcPointerPosition,
  rcPointeredCell,
  rcSelectedCoordinates,
  rcViewBox,
  rcXYWHZ,
  selectCoordinates,
} from './recoil.app.mts';
import * as style from './style.module.scss';
import { toDRCellId } from './util.mts';

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
      onContextMenu={useOnContextMenu()}
    >
      <PointeredCell />
      <Cells />
      <SelectedCoordinates />
    </svg>
  );
};

const useOnClick = () =>
  useRecoilCallback(
    (cbi) => () => {
      const { get, reset } = toSelectorOpts(cbi);
      if (get(rcDragging)) {
        return;
      }
      reset(rcSelectedCoordinates);
    },
    [],
  );

const useOnContextMenu = () =>
  useRecoilCallback(
    (cbi) => (event: MouseEvent) => {
      event.preventDefault();
      document.getSelection()?.removeAllRanges();
      const { get, set } = toSelectorOpts(cbi);
      if (!get(rcDevMode) || get(rcDragging)) {
        return;
      }
      const [x, y, , , z] = get(rcXYWHZ);
      const rect = event.currentTarget.getBoundingClientRect();
      const cx = Math.round(x + (event.clientX - rect.left) / z);
      const cy = -Math.round(y + (event.clientY - rect.top) / z);
      const cellId = toDRCellId(cx, cy);
      const cell = get(rcCell(cellId));
      if (cell) {
        return;
      }
      const alt = event.shiftKey || event.metaKey || event.ctrlKey;
      set(
        rcSelectedCoordinates,
        selectCoordinates(cellId, alt ? 'add' : 'toggle'),
      );
    },
    [],
  );

const PointeredCell = () => {
  const pointeredCell = useRecoilValue(rcPointeredCell);
  const dragging = useRecoilValue(rcDragging);
  if (!pointeredCell || dragging) {
    return null;
  }
  return (
    <rect
      className={style.pointered}
      x={pointeredCell[0] - 0.5}
      y={-pointeredCell[1] - 0.5}
      width="1"
      height="1"
    />
  );
};

const Cells = () => {
  const cells = useRecoilValue(rcCellList);
  const devMode = useRecoilValue(rcDevMode);
  return [
    ...(function* (): Generator<ReactNode> {
      for (const cellId of cells) {
        yield (
          <DRCellG key={cellId.join(',')} cellId={cellId} debug={devMode} />
        );
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
