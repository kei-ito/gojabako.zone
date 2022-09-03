import {useEffect, useState} from 'react';

export const useElementWidth = (
    element?: Element | null,
    initialWidth = 0,
) => {
    const [width, setWidth] = useState(initialWidth);
    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width);
            }
        });
        if (element) {
            observer.observe(element);
        }
        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [element]);
    return width;
};
