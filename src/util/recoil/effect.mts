import type { AtomEffect } from 'recoil';
import { isClient } from '../env.mts';

export const clientEffects = <T,>(
  ...effects: Array<AtomEffect<T>>
): Array<AtomEffect<T>> => (isClient ? effects : []);
