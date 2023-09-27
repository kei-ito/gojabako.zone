'use client';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isClient } from '../../util/env.mts';
import { noop } from '../../util/noop.mts';
import { Select } from '../Select';
import * as style from './style.module.scss';

export const ElementInspector = () => {
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
  return (
    <div ref={setContainer} className={style.controller}>
      <BaseWidthSelector parent={parent} />
    </div>
  );
};

interface BaseWidthSelectorProps {
  parent?: HTMLElement | null;
}

const BaseWidthSelector = ({ parent }: BaseWidthSelectorProps) => {
  const [baseWidth, setBaseWidth] = useState(getInitialBaseWidth());
  useEffect(() => {
    const url = new URL(location.href);
    if (baseWidth === 'default') {
      url.searchParams.delete('w');
    } else {
      url.searchParams.set('w', `${baseWidth}`);
    }
    if (location.href !== url.href) {
      history.replaceState(null, '', url);
    }
  }, [baseWidth]);
  useEffect(() => {
    if (!parent) {
      return noop;
    }
    if (baseWidth !== 'default') {
      parent.style.setProperty('--gjBaseWidth', '94%');
    }
    if (/^[1-9]\d+$/.test(baseWidth)) {
      parent.style.setProperty('inline-size', `${baseWidth}px`);
    }
    return () => {
      parent.style.removeProperty('--gjBaseWidth');
      parent.style.removeProperty('inline-size');
    };
  }, [parent, baseWidth]);
  const onChange = useCallback(
    ({ target }: ChangeEvent<HTMLSelectElement>) => setBaseWidth(target.value),
    [setBaseWidth],
  );
  return (
    <>
      <label className="material-symbols-rounded" htmlFor="BaseWidthSelector">
        width
      </label>
      <Select id="BaseWidthSelector" onChange={onChange} value={baseWidth}>
        <option value="default">default</option>
        <option value="full">full</option>
        <option value="500">500px</option>
        <option value="300">300px</option>
      </Select>
    </>
  );
};

const getInitialBaseWidth = () => {
  if (!isClient) {
    return 'default';
  }
  return new URLSearchParams(location.search).get('w') ?? 'default';
};
