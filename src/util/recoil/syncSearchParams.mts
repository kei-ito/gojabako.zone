import { isFiniteNumber } from "@nlib/typing";
import type { AtomEffect } from "recoil";
import { debounce } from "../debounce.mts";
import { getCurrentUrl } from "../getCurrentUrl.mts";

const debounceMs = 200;

export const syncSearchParamsBoolean = function* (
  key: string,
  defaultValue: boolean,
): Generator<AtomEffect<boolean>> {
  yield ({ setSelf }) => {
    const url = getCurrentUrl();
    const value = url.searchParams.get(key);
    if (value === "1" || value === "0") {
      setSelf(value === "1");
    } else {
      setSelf(defaultValue);
      if (value) {
        url.searchParams.delete(key);
        history.replaceState(null, "", url);
      }
    }
  };
  yield ({ onSet }) => {
    const sync = debounce((value: boolean) => {
      const url = getCurrentUrl();
      if (value === defaultValue) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value ? "1" : "0");
      }
      history.replaceState(null, "", url);
    }, debounceMs);
    onSet(sync);
    return sync.abort;
  };
};

export const syncSearchParamsNumber = function* (
  key: string,
  defaultValue: number,
  precision = 0,
): Generator<AtomEffect<number>> {
  yield ({ setSelf }) => {
    const url = getCurrentUrl();
    const param = url.searchParams.get(key);
    const value = param && Number(param);
    if (isFiniteNumber(value)) {
      setSelf(value);
    } else {
      setSelf(defaultValue);
      if (param) {
        url.searchParams.delete(key);
        history.replaceState(null, "", url);
      }
    }
  };
  yield ({ onSet }) => {
    const sync = debounce((value: number) => {
      const url = getCurrentUrl();
      if (value === defaultValue) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value.toFixed(precision));
      }
      history.replaceState(null, "", url);
    }, debounceMs);
    onSet(sync);
    return sync.abort;
  };
};
