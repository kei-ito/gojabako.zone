'use client';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { noop } from '../../util/noop.mts';
import * as style from './style.module.scss';

export const ElementInspector = () => {
  const [baseWidth, setBaseWidth] = useState<number>(-1);
  const [div, setContainer] = useState<HTMLElement | null>(null);
  const parent = useMemo(() => div?.parentElement, [div]);
  useEffect(() => {
    if (!parent) {
      return noop;
    }
    const abc = new AbortController();
    parent.classList.add(style.parent);
    return () => {
      abc.abort();
      parent.classList.remove(style.parent);
    };
  }, [parent]);
  useEffect(() => {
    if (!parent || !(0 < baseWidth)) {
      return noop;
    }
    parent.style.setProperty('--gjBaseWidth', '94%');
    parent.style.setProperty('inline-size', `${baseWidth}px`);
    return () => {
      parent.style.removeProperty('--gjBaseWidth');
      parent.style.removeProperty('inline-size');
    };
  }, [parent, baseWidth]);
  const onChangeWidth = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setBaseWidth(Number(event.target.value || -1));
  }, []);
  return (
    <div ref={setContainer} className={style.controller}>
      <label className="material-symbols-rounded" htmlFor="BaseWidthSelector">
        width
      </label>
      <select id="BaseWidthSelector" onChange={onChangeWidth}>
        <option value="">default</option>
        {[600, 500, 400, 300].map((w) => (
          <option key={w} value={w}>
            {w}px
          </option>
        ))}
      </select>
    </div>
  );
};
