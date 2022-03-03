import {useCallback, useEffect, useReducer} from 'react';
import {useResizeObserver} from './useResizeObserver';

interface Size {
    width: number,
    height: number,
}

const reducer = (currentSize: Size, {width, height}: Size) => {
    if (currentSize.width === width && currentSize.height === height) {
        return currentSize;
    }
    return {width, height};
};

export const useElementSize = (
    element?: Element | null,
    initialSize: Size = {width: 0, height: 0},
) => {
    const [size, dispatch] = useReducer(reducer, initialSize);
    useResizeObserver(element, useCallback(({contentRect}: ResizeObserverEntry) => {
        dispatch(contentRect);
    }, []));
    useEffect(() => {
        if (element) {
            dispatch(element.getBoundingClientRect());
        }
    }, [element]);
    return size;
};
