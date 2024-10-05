import { useRecoilCallback } from "recoil";
import { iterate } from "../../util/iterate.ts";
import { toRecoilSelectorOpts } from "../../util/recoil/selector.ts";
import { rcCell, rcDragging } from "./recoil.app.ts";
import { sendDRMessage } from "./recoil.send.ts";
import type { DRCellId } from "./util.ts";
import {
  DRDiagonalDirections,
  DRDirections,
  generateMessageProps,
  stepDRSharedState,
} from "./util.ts";

export const useOnPressCell = (cellId: DRCellId) =>
  useRecoilCallback(
    (cbi) => () => {
      const rso = toRecoilSelectorOpts(cbi);
      const { get, set } = rso;
      if (get(rcDragging)) {
        return;
      }
      const cell = get(rcCell(cellId));
      if (!cell) {
        return;
      }
      for (const mode of iterate(DRDirections, DRDiagonalDirections)) {
        sendDRMessage(rso, cellId, {
          ...generateMessageProps(),
          mode,
          type: "reversi1",
          payload: cell.shared,
        });
      }
      const nextSharedState = stepDRSharedState(cell.shared);
      sendDRMessage(rso, cellId, {
        ...generateMessageProps(),
        mode: "spread",
        type: "setShared",
        payload: nextSharedState,
      });
      set(rcCell(cellId), {
        ...cell,
        state: cell.shared.state,
        shared: nextSharedState,
      });
    },
    [cellId],
  );
