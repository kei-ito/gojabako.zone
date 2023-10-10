import type { CallbackInterface, RecoilState, RecoilValue } from 'recoil';

export interface RecoilSelectorOpts {
  set: <T>(recoilVal: RecoilState<T>, newVal: T | ((currVal: T) => T)) => void;
  get: <T>(recoilVal: RecoilValue<T>) => T;
  reset: <T>(recoilVal: RecoilState<T>) => void;
}

export const toSelectorOpts = ({
  set,
  reset,
  snapshot,
}: CallbackInterface): RecoilSelectorOpts => {
  const get = <T,>(recoilValue: RecoilValue<T>) =>
    snapshot.getLoadable(recoilValue).getValue();
  return { set, reset, get };
};
