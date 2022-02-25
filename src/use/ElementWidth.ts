import {useCallback, useState} from 'react';
import {useResizeObserver} from './ResizeObserver';

export const useElementWidth = (
    element?: Element | null,
    initialWidth = 0,
) => {
    const [width, setWidth] = useState(initialWidth);
    useResizeObserver(element, useCallback(({contentRect}: ResizeObserverEntry) => {
        setWidth(contentRect.width);
    }, []));
    return width;
};
