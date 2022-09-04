import {useEffect, useReducer} from 'react';

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
    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                dispatch(entry.contentRect);
            }
        });
        if (element) {
            observer.observe(element);
            dispatch(element.getBoundingClientRect());
        }
        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [element]);
    return size;
};
