import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useRect } from '../use/Rect.mts';
import { rcPointerPosition, rcTooltip } from './recoil.app.mts';
import * as style from './style.module.scss';

export const DistributedReversiTooltip = () => {
  const [div, setDiv] = useState<HTMLElement | null>(null);
  const rect = useRect(div?.parentElement);
  const xy = useRecoilValue(rcPointerPosition);
  const message = useRecoilValue(rcTooltip);
  return (
    <div
      ref={setDiv}
      className={style.tooltip}
      style={
        message && rect
          ? { left: xy[0] - rect.left, top: xy[1] - rect.top + 20 }
          : { display: 'none' }
      }
    >
      {message}
    </div>
  );
};
