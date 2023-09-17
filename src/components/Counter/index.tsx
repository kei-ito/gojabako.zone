'use client';
import { isFiniteNumber } from '@nlib/typing';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import style from './style.module.scss';

export const Counter = () => {
  const [count, setCount] = useState(100);
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (isFiniteNumber(value)) {
      setCount(value);
    }
  }, []);
  useEffect(() => {
    const abc = new AbortController();
    if (input) {
      input.addEventListener(
        'wheel',
        /** This disables page scrolling */
        (event) => event.stopPropagation(),
        { passive: false, signal: abc.signal },
      );
    }
    return () => abc.abort();
  }, [input]);
  return (
    <span className={style.container}>
      <button onClick={decrement}>-1</button>
      <input
        ref={setInput}
        type="number"
        step={1}
        value={count}
        onChange={onChange}
      />
      <button onClick={increment}>+1</button>
    </span>
  );
};
