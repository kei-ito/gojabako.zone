import { isFiniteNumber } from '@nlib/typing';
import type { AtomEffect } from 'recoil';
import { isServer } from '../env.mts';

export const syncSearchParamsBoolean = function* (
  key: string,
  defaultValue: boolean,
): Generator<AtomEffect<boolean>> {
  if (isServer) {
    return;
  }
  yield ({ setSelf }) => {
    const url = new URL(location.href);
    const value = url.searchParams.get(key);
    if (value === '1' || value === '0') {
      setSelf(value === '1');
    } else {
      setSelf(defaultValue);
      if (value) {
        url.searchParams.delete(key);
        history.replaceState(null, '', url);
      }
    }
  };
  yield ({ onSet }) => {
    onSet((value) => {
      const url = new URL(location.href);
      if (value === defaultValue) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value ? '1' : '0');
      }
      history.replaceState(null, '', url);
    });
  };
};

export const syncSearchParamsNumber = function* (
  key: string,
  defaultValue: number,
): Generator<AtomEffect<number>> {
  if (isServer) {
    return;
  }
  yield ({ setSelf }) => {
    const url = new URL(location.href);
    const param = url.searchParams.get(key);
    const value = param && Number(param);
    if (isFiniteNumber(value)) {
      setSelf(value);
    } else {
      setSelf(defaultValue);
      if (param) {
        url.searchParams.delete(key);
        history.replaceState(null, '', url);
      }
    }
  };
  yield ({ onSet }) => {
    onSet((value) => {
      const url = new URL(location.href);
      if (value === defaultValue) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, `${value}`);
      }
      history.replaceState(null, '', url);
    });
  };
};
