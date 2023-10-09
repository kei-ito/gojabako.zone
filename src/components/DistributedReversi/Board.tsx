import type { MouseEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { writer } from '../../util/recoil/selector.mts';
import { useRect } from '../use/Rect.mts';
import { DistributedReversiCell } from './Cell';
import type { XYWHZ } from './recoil.app.mts';
import {
  rcAddCell,
  rcCellList,
  rcDragging,
  rcSelectedCells,
  rcViewBox,
  rcXYWHZ,
} from './recoil.app.mts';
import * as style from './style.module.scss';
import type { DRCellId } from './util.mts';

export const DistributedReversiBoard = () => {
  const [element, setElement] = useState<Element | null>(null);
  useSyncRect(element);
  useGrab(element as HTMLElement);
  const cells = useRecoilValue(rcCellList);
  const selectedCells = useRecoilValue(rcSelectedCells);
  return (
    <svg
      ref={setElement}
      className={style.board}
      viewBox={useRecoilValue(rcViewBox)}
      onClick={useSetRecoilState(rcOnClickBoard)}
    >
      {element && [
        ...(function* (): Generator<ReactNode> {
          for (const cellId of cells) {
            yield (
              <DistributedReversiCell key={cellId.join(',')} cellId={cellId} />
            );
          }
          for (const [x, y] of selectedCells) {
            yield (
              <rect
                key={`selected ${x} ${y}`}
                className={style.selected}
                x={x - 0.5}
                y={-y - 0.5}
                width="1"
                height="1"
              />
            );
          }
        })(),
      ]}
    </svg>
  );
};

const rcOnClickBoard = writer<MouseEvent>({
  key: 'OnClickBoard',
  set: ({ get, set }, { clientX, clientY, currentTarget }) => {
    if (get(rcDragging)) {
      return;
    }
    const [x, y, , , z] = get(rcXYWHZ);
    const rect = currentTarget.getBoundingClientRect();
    const cx = Math.round(x + (clientX - rect.left) / z);
    const cy = -Math.round(y + (clientY - rect.top) / z);
    set(rcAddCell, [cx, cy] as DRCellId);
  },
});

const useSyncRect = (element: Element | null) => {
  const [lastRect, setLastRect] = useState<DOMRect | null>(null);
  const rect = useRect(element);
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
    [rect],
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
