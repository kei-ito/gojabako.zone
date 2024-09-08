import type { MouseEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from "recoil";
import { classnames } from "../../util/classnames.mts";
import { toRecoilSelectorOpts } from "../../util/recoil/selector.mts";
import { useRect } from "../use/Rect.mts";
import { DRCellG } from "./Cell";
import type { XYWHZ } from "./recoil.app.mts";
import {
  rcCell,
  rcCellList,
  rcDragging,
  rcEditMode,
  rcPointerPosition,
  rcPointeredCell,
  rcSelectedCoordinates,
  rcViewBox,
  rcXYWHZ,
} from "./recoil.app.mts";
import * as style from "./style.module.scss";
import { defaultDRCell, toDRCellId } from "./util.mts";

export const DRBoard = () => {
  const [element, setElement] = useState<Element | null>(null);
  const editMode = useRecoilValue(rcEditMode);
  useSyncRect(element);
  useSyncPointerPosition(element as HTMLElement);
  useGrab(element as HTMLElement);
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: 仮実装のため省略
    <svg
      ref={setElement}
      className={classnames(style.board, editMode && style.editing)}
      viewBox={useRecoilValue(rcViewBox)}
      onClick={useOnClick()}
    >
      <title>DRBoard</title>
      <Cells />
      <SelectedCoordinates />
      {editMode && <EditGuide />}
    </svg>
  );
};

const useOnClick = () =>
  useRecoilCallback(
    (cbi) => (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const { get, set, reset } = toRecoilSelectorOpts(cbi);
      if (get(rcDragging)) {
        return;
      }
      reset(rcSelectedCoordinates);
      const editMode = get(rcEditMode);
      if (editMode) {
        const [x0, y0, , , z] = get(rcXYWHZ);
        const { nativeEvent: e } = event;
        const cellId = toDRCellId(e.offsetX / z + x0, -e.offsetY / z - y0);
        if (get(rcCell(cellId))) {
          reset(rcCell(cellId));
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
      }
    },
    [],
  );

const EditGuide = () => {
  const cellId = useRecoilValue(rcPointeredCell);
  const dragging = useRecoilValue(rcDragging);
  const list = useRecoilValue(rcCellList);
  if (!cellId || dragging) {
    return null;
  }
  const transform = `translate(${cellId[0]},${-cellId[1]})`;
  const empty = !list.has(cellId);
  const s = 0.52;
  const l = empty ? 0.24 : 0.2;
  return (
    <g className={style.pointered} transform={transform}>
      <rect x={-s} y={-s} width={s * 2} height={s * 2} />
      <path
        d={
          empty
            ? `M${-l} 0H${l}M0 ${-l}V${l}`
            : `M${-l} ${-l}L${l} ${l}M${-l} ${l}L${l} ${-l}`
        }
      />
    </g>
  );
};

const Cells = () => {
  const cells = useRecoilValue(rcCellList);
  return [
    ...(function* (): Generator<ReactNode> {
      for (const cellId of cells) {
        yield <DRCellG key={cellId.join(",")} cellId={cellId} />;
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
        "pointermove",
        (e) => setPosition([e.offsetX, e.offsetY]),
        { signal: abc.signal },
      );
      board.addEventListener("pointerleave", () => setPosition(null), {
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: rect,setXYZの変更のみ見る
  useEffect(() => {
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
  }, [rect, setXYZ]);
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
  const onPointerDown = useRecoilCallback(
    ({ set, snapshot }) =>
      (e0: PointerEvent) => {
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
        target.addEventListener("pointermove", onMove, { signal: abc.signal });
        target.addEventListener("pointerup", onUp, { signal: abc.signal });
      },
    [],
  );
  useEffect(() => {
    const abc = new AbortController();
    board?.addEventListener("pointerdown", onPointerDown, {
      signal: abc.signal,
    });
    return () => abc.abort();
  }, [board, onPointerDown]);
};
