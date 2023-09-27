import type { MouseEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { noop } from '../../util/noop.mts';
import { useRect } from '../use/Rect.mts';
import { DistributedReversiCell } from './Cell';
import { rcCellList, rcInitCell, rcXYWHZ } from './recoil.mts';
import * as style from './style.module.scss';
import type { DRCoordinate } from './util.mts';

const baseCellSize = 100;

export const DistributedReversiBoard = () => {
  const [element, setElement] = useState<Element | null>(null);
  useSyncRect(element);
  const onClick = useOnClick();
  useWheel(element as HTMLElement);
  const [x, y, w, h] = useRecoilValue(rcXYWHZ);
  return (
    <svg
      ref={setElement}
      className={style.board}
      viewBox={`${x} ${y} ${w} ${h}`}
      onClick={onClick}
    >
      {element && <Cells />}
    </svg>
  );
};

const useOnClick = () => {
  const xywhz = useRecoilValue(rcXYWHZ);
  return useRecoilCallback(
    ({ set }) =>
      ({ clientX, clientY, currentTarget }: MouseEvent) => {
        const [x, y, , , z] = xywhz;
        const rect = currentTarget.getBoundingClientRect();
        const s = z / baseCellSize;
        const cx = Math.round(x + (clientX - rect.left) * s);
        const cy = Math.round(y + (clientY - rect.top) * s);
        set(rcInitCell, `${cx},${cy}` as const);
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
          const s = z / baseCellSize;
          return [x - (dx * s) / 2, y - (dy * s) / 2, w * s, h * s, z];
        });
      } else {
        setXYZ(([_x, _y, _w, _h, z]) => {
          const s = z / baseCellSize;
          return [
            (rect.width / -2) * s,
            (rect.height / -2) * s,
            w * s,
            h * s,
            z,
          ];
        });
      }
      setLastRect(rect);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rect],
  );
};

const useWheel = (element: HTMLElement | null) => {
  const setXYZ = useSetRecoilState(rcXYWHZ);
  useEffect(() => {
    if (!element) {
      return noop;
    }
    const abc = new AbortController();
    element.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        event.preventDefault();
        setXYZ(([x, y, w, h, z]) => {
          const s = 0.01 * z;
          const newX = x + event.deltaX * s;
          const newY = y + event.deltaY * s;
          return [newX, newY, w, h, z];
        });
      },
      { passive: false, signal: abc.signal },
    );
    return () => abc.abort();
  }, [element, setXYZ]);
};

const Cells = () => {
  const list = useRecoilValue(rcCellList);
  return [...listCell(list)];
};

const listCell = function* (
  list: Iterable<DRCoordinate>,
): Generator<ReactNode> {
  for (const id of list) {
    yield <DistributedReversiCell key={id} id={id} />;
  }
};
