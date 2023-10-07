import type {
  GetRecoilValue,
  ReadOnlySelectorFamilyOptions,
  ReadOnlySelectorOptions,
  ResetRecoilState,
  SerializableParam,
  SetRecoilState,
} from 'recoil';
import { DefaultValue, selector, selectorFamily } from 'recoil';

export interface RecoilSelectorOpts {
  set: SetRecoilState;
  get: GetRecoilValue;
  reset: ResetRecoilState;
}

const throwWriteOnlyError = (key: string) => () => {
  throw new Error(`${key} is write-only`);
};

export interface RecoilWriterOptions<T>
  extends Omit<ReadOnlySelectorOptions<T>, 'get'> {
  set: (opts: RecoilSelectorOpts, newValue: T) => void;
}

export const writer = <T,>({ key, set, ...others }: RecoilWriterOptions<T>) =>
  selector<T>({
    ...others,
    key,
    get: throwWriteOnlyError(key),
    set: (opts, newValue) => {
      if (!(newValue instanceof DefaultValue)) {
        set(opts, newValue);
      }
    },
  });

export interface RecoilWriterFamilyOptions<T, P extends SerializableParam>
  extends Omit<ReadOnlySelectorFamilyOptions<T, P>, 'get'> {
  set: (param: P) => (opts: RecoilSelectorOpts, newValue: T) => void;
}

export const writerFamily = <T, P extends SerializableParam>({
  key,
  set,
  ...others
}: RecoilWriterFamilyOptions<T, P>) =>
  selectorFamily<T, P>({
    ...others,
    key,
    get: throwWriteOnlyError(key),
    set: (param) => {
      const setter = set(param);
      return (opts, newValue) => {
        if (!(newValue instanceof DefaultValue)) {
          setter(opts, newValue);
        }
      };
    },
  });
