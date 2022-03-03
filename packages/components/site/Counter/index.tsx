import type {FC} from 'react';
import {useCallback, useReducer} from 'react';
import {className} from './style.module.css';

const reducer = (current: number, diff: number) => current + diff;

export const Counter: FC = () => {
    const [count, dispatch] = useReducer(reducer, 0);
    const increment = useCallback(() => dispatch(1), []);
    const decrement = useCallback(() => dispatch(-1), []);
    return <div className={className.container}>
        <button className={className.button} onClick={decrement}>-1</button>
        <div className={className.button}>{count}</div>
        <button className={className.button} onClick={increment}>+1</button>
    </div>;
};
