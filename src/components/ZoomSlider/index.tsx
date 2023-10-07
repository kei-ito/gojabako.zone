'use client';
import type { MouseEvent } from 'react';
import { useCallback } from 'react';
import { IconClass, classnames } from '../../util/classnames.mts';
import type { LogSliderProps } from '../LogSlider';
import { LogSlider } from '../LogSlider';
import * as style from './style.module.scss';

// eslint-disable-next-line max-lines-per-function
export const ZoomSlider = ({ className, ...props }: LogSliderProps) => {
  const onClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const input = findSiblingRangeInput(button);
    if (!input) {
      return;
    }
    switch (button.value) {
      case '-':
        input.value = (Number(input.value) - 0.1).toFixed(4);
        break;
      case '+':
        input.value = (Number(input.value) + 0.1).toFixed(4);
        break;
      default:
    }
  }, []);
  return (
    <div className={classnames(style.container, className)}>
      <button className={IconClass} value="-" onClick={onClick}>
        zoom_out
      </button>
      <LogSlider {...props} />
      <button className={IconClass} value="+" onClick={onClick}>
        zoom_in
      </button>
    </div>
  );
};

const findSiblingRangeInput = (e: Element): HTMLInputElement | null => {
  for (const sibling of e.parentElement?.children ?? []) {
    if (isRangeInput(sibling)) {
      return sibling;
    }
  }
  return null;
};

const isRangeInput = (e: Element): e is HTMLInputElement =>
  e.tagName.toLowerCase() === 'input' && e.getAttribute('type') === 'range';
