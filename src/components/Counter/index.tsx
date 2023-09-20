'use client';
import { useCallback, useState } from 'react';
import { Button } from '../Button';
import style from './style.module.scss';

export const Counter = () => {
  const [count, setCount] = useState(100);
  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  return (
    <span className={style.container}>
      <Button onClick={decrement}>-1</Button>
      <span>{count}</span>
      <Button onClick={increment}>+1</Button>
    </span>
  );
};
