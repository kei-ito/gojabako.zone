'use client';
import type { MouseEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { noop } from '../../util/noop.mts';
import { useRect } from '../use/Rect.mts';
import { DistributedReversiCell } from './Cell';
import {
  rcAddCell,
  rcCellList,
  rcViewBox,
  rcXYWHZ,
  rcZoom,
} from './recoil.app.mts';
import * as style from './style.module.scss';
import type { DRCellId } from './util.mts';

export const DistributedReversiBoard = () => {
  const [element, setElement] = useState<Element | null>(null);
  useSyncRect(element);
  const onClick = useOnClick();
  useWheel(element as HTMLElement);
  useGrab(element as HTMLElement);
  const viewBox = useRecoilValue(rcViewBox);
  return (
    <svg
      ref={setElement}
      className={style.board}
      viewBox={viewBox}
      onClick={onClick}
    >
      {element && <Cells />}
    </svg>
  );
};

const Cells = () => {
  const list = useRecoilValue(rcCellList);
  return [...listCell(list)];
};

const listCell = function* (list: Iterable<DRCellId>): Generator<ReactNode> {
  for (const cellId of list) {
    yield <DistributedReversiCell key={cellId.join(',')} cellId={cellId} />;
  }
};

const useOnClick = () => {
  const xywhz = useRecoilValue(rcXYWHZ);
  return useRecoilCallback(
    ({ set }) =>
      ({ clientX, clientY, currentTarget }: MouseEvent) => {
        if ((currentTarget as HTMLElement).dataset.dragging) {
          return;
        }
        const [x, y, , , z] = xywhz;
        const rect = currentTarget.getBoundingClientRect();
        const cx = Math.round(x + (clientX - rect.left) / z);
        const cy = -Math.round(y + (clientY - rect.top) / z);
        set(rcAddCell, [cx, cy] as DRCellId);
      },
    [xywhz],
  );
};

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

const useWheel = (board: HTMLElement | null) => {
  const setZoom = useSetRecoilState(rcZoom);
  useEffect(() => {
    if (!board) {
      return noop;
    }
    const abc = new AbortController();
    board.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        event.preventDefault();
        setZoom(({ z }) => {
          const rect = board.getBoundingClientRect();
          const cx = (event.clientX - rect.left) / rect.width;
          const cy = (event.clientY - rect.top) / rect.height;
          const rz = 1 - event.deltaY / 300;
          return { z: z * rz, cx, cy };
        });
      },
      { passive: false, signal: abc.signal },
    );
    return () => abc.abort();
  }, [board, setZoom]);
};

// eslint-disable-next-line max-lines-per-function
const useGrab = (board: HTMLElement | null) => {
  const set = useSetRecoilState(rcXYWHZ);
  // eslint-disable-next-line max-lines-per-function
  useEffect(() => {
    if (!board) {
      return noop;
    }
    const abc = new AbortController();
    let abc2 = new AbortController();
    board.addEventListener(
      'pointerdown',
      (down: PointerEvent) => {
        const target = down.target as HTMLElement | null;
        if (!target || board.dataset.dragging) {
          return;
        }
        target.setPointerCapture(down.pointerId);
        abc2.abort();
        abc2 = new AbortController();
        const diff = (e: PointerEvent): [number, number] => [
          e.clientX - down.clientX,
          e.clientY - down.clientY,
        ];
        const onMove = (e: PointerEvent) => {
          if (e.pointerId === down.pointerId) {
            set(([x, y, w, h, z]) => {
              const d = diff(e);
              if (!board.dataset.dragging && 10 < Math.hypot(...d)) {
                board.dataset.dragging = '1';
              }
              return [x, y, w, h, z, d];
            });
          }
        };
        const onUp = (e: PointerEvent) => {
          target.releasePointerCapture(down.pointerId);
          abc2.abort();
          set(([x, y, w, h, z]) => {
            const d = diff(e);
            return [x - d[0] / z, y - d[1] / z, w, h, z];
          });
          setTimeout(() => {
            delete board.dataset.dragging;
          });
        };
        board.addEventListener('pointermove', onMove, { signal: abc2.signal });
        board.addEventListener('pointerup', onUp, { signal: abc2.signal });
      },
      { signal: abc.signal },
    );
    return () => {
      abc.abort();
      abc2.abort();
    };
  }, [board, set]);
};
