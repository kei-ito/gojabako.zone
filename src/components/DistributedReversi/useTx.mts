import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { rcCell } from './recoil.mts';
import type { DRCoordinate, DRDirection, DRMessage } from './util.mts';
import { getAdjecentId, getMsWithLag, pickMessage } from './util.mts';

export const useTx = (id: DRCoordinate) => {
  const cell = useRecoilValue(rcCell(id));
  const send = useRecoilCallback(
    ({ set }) =>
      (d: DRDirection, msg: DRMessage, buffer: Array<DRMessage>) => {
        const nextId = getAdjecentId(id, d);
        set(rcCell(nextId), (c) => {
          if (!c) {
            return c;
          }
          const key = `rx${d}` as const;
          return { ...c, [key]: [...c[key], msg] };
        });
        set(rcCell(id), (c) => {
          if (!c) {
            return c;
          }
          return { ...c, [`tx${d}`]: buffer };
        });
      },
    [id],
  );
  useEffect(() => {
    const timerId = setTimeout(() => {
      const tuple = cell && pickMessage(cell, 'rx');
      if (cell && tuple) {
        send(...tuple);
      }
    }, getMsWithLag());
    return () => clearTimeout(timerId);
  }, [cell, send]);
};
