'use client';
import { useCallback, useReducer } from 'react';
import style from './style.module.scss';

const reducer = (current: number, diff: number) => current + diff;

export const Counter = () => {
  const [count, dispatch] = useReducer(reducer, 0);
  const increment = useCallback(() => dispatch(1), []);
  const decrement = useCallback(() => dispatch(-1), []);
  return (
    <div className={style.container}>
      <button className={style.button} onClick={decrement}>
        -1
      </button>
      <div className={style.button}>{count}</div>
      <button className={style.button} onClick={increment}>
        +1
      </button>
    </div>
  );
};
