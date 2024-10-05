import { useEffect, useState } from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";
import { toRecoilSelectorOpts } from "../../util/recoil/selector.ts";
import { rcCell } from "./recoil.app.ts";
import { sendDRMessage } from "./recoil.send.ts";
import type { DRBufferId } from "./util.ts";
import { generateMessageProps, getAdjacentId } from "./util.ts";

export const useOnConnection = (bufferId: DRBufferId) => {
  const [sent, setSent] = useState(false);
  const adjacentCell = useRecoilValue(rcCell(getAdjacentId(bufferId)));
  const onConnection = useRecoilCallback(
    (cbi) => () => {
      const rso = toRecoilSelectorOpts(cbi);
      const { get } = rso;
      const cell = get(rcCell(bufferId[0]));
      if (cell) {
        sendDRMessage(rso, bufferId[0], {
          ...generateMessageProps(),
          type: "connect",
          mode: bufferId[1],
          ttl: 1,
          payload: cell.shared,
        });
      }
    },
    [bufferId],
  );
  useEffect(() => {
    if (adjacentCell && !sent) {
      onConnection();
      setSent(true);
    }
  }, [adjacentCell, onConnection, sent]);
};
