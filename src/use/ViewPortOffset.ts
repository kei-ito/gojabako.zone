import {useEffect, useState} from 'react';
import {isBrowser} from '../../packages/dom/global';
import {globalThis} from '../../packages/es/global';

export const useViewPortOffset = () => {
    const [offset, setOffset] = useState({left: 0, top: 0});
    useEffect(() => {
        const eventNames = ['pointermove', 'pointerdown'] as const;
        const onEvent = (event: PointerEvent) => {
            const sx = globalThis.screenLeft || globalThis.screenX;
            const sy = globalThis.screenTop || globalThis.screenY;
            const appX = event.screenX - sx;
            const appY = event.screenY - sy;
            const left = appX - event.clientX;
            const top = appY - event.clientY;
            setOffset((current) => {
                if (current.left === left && current.top === top) {
                    return current;
                }
                return {left, top};
            });
        };
        const stop = () => {
            if (isBrowser) {
                for (const eventName of eventNames) {
                    globalThis.removeEventListener(eventName, onEvent);
                }
            }
        };
        if (isBrowser) {
            for (const eventName of eventNames) {
                globalThis.addEventListener(eventName, onEvent);
            }
        }
        return stop;
    }, []);
    return offset;
};
