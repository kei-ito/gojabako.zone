import {useCallback, useState} from 'react';
import {useResizeObserver} from './ResizeObserver';

export const useElementRect = (
    element?: Element | null,
    initialRect?: DOMRectReadOnly,
) => {
    const [rect, setRect] = useState(initialRect || null);
    useResizeObserver(element, useCallback((entry: ResizeObserverEntry) => {
        setRect(entry.contentRect);
    }, []));
    return rect;
};
