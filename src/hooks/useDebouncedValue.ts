import {useEffect, useState} from 'react';

export const useDebouncedValue = <T>(value: T, durationMs: number) => {
    const [debounced, setDebounced] = useState<T>(value);
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebounced(value);
        }, durationMs);
        return () => {
            clearTimeout(timerId);
        };
    }, [value, durationMs]);
    return debounced;
};
