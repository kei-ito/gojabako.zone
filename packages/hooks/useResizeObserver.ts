import {useEffect, useMemo} from 'react';

export const useResizeObserver = (
    element: Element | null | undefined,
    onResize: (entry: ResizeObserverEntry) => void,
) => {
    const observer = useMemo(() => new ResizeObserver((entries) => {
        for (const entry of entries) {
            onResize(entry);
        }
    }), [onResize]);
    useEffect(() => {
        if (element) {
            observer.observe(element);
        }
        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [element, observer]);
    return observer;
};
