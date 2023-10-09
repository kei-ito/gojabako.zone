import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useRect } from '../use/Rect.mts';
import {
  rcDragging,
  rcPointerPosition,
  rcFloaterContent,
} from './recoil.app.mts';
import * as style from './style.module.scss';

export const DistributedReversiFloater = () => {
  const [div, setDiv] = useState<HTMLElement | null>(null);
  const rect = useRect(div?.parentElement);
  const xy = useRecoilValue(rcPointerPosition);
  const Content = useRecoilValue(rcFloaterContent);
  const dragging = useRecoilValue(rcDragging);
  if (!Content || dragging) {
    return null;
  }
  return (
    <div
      ref={setDiv}
      className={style.floater}
      style={
        rect
          ? { left: xy[0] - rect.left, top: xy[1] - rect.top + 20 }
          : { display: 'none' }
      }
    >
      <Content />
    </div>
  );
};
