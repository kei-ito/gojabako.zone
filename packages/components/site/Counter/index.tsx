import type {FC} from 'react';
import {useCallback, useReducer} from 'react';
import styled from 'styled-components';

const reducer = (current: number, diff: number) => current + diff;

export const Counter: FC = () => {
    const [count, dispatch] = useReducer(reducer, 0);
    const increment = useCallback(() => dispatch(1), []);
    const decrement = useCallback(() => dispatch(-1), []);
    return <Container>
        <Button onClick={decrement}>-1</Button>
        <Count>{count}</Count>
        <Button onClick={increment}>+1</Button>
    </Container>;
};

const Container = styled.div`
    display: grid;
    grid-template-columns: 2rem 3rem 2rem;
    justify-items: center;
    justify-content: stretch;
    align-items: baseline;
    text-align: center;
`;

const Button = styled.button`
    padding: 0.2rem 0.5rem;
    border-style: solid;
    border-radius: 0.2rem;
`;

const Count = styled.div`
    min-inline-size: 3.5rem;
    padding-inline-start: 0.5rem;
    padding-inline-end: 0.5rem;
    font-size: 140%;
`;
