'use client';
import { useCallback, useState } from 'react';
import { SecondaryButton } from '../Button';
import style from './style.module.scss';

export const Counter = () => {
  const [count, setCount] = useState(100);
  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  return (
    <span className={style.container}>
      <SecondaryButton onClick={decrement}>-1</SecondaryButton>
      <span>{count}</span>
      <SecondaryButton onClick={increment}>+1</SecondaryButton>
    </span>
  );
};
