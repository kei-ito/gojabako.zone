/* eslint-disable class-methods-use-this, @typescript-eslint/no-unnecessary-condition */
import {globalThis, Object} from '../es/global';

export const isBrowser = 'window' in globalThis;
export const ResizeObserver = globalThis.ResizeObserver || class Fallback {
    public observe(_element: Element) {
        // do nothing
    }

    public unobserve(_element: Element) {
        // do nothing
    }

    public disconnect() {
        // do nothing
    }
};
export const {requestAnimationFrame} = globalThis;
export const {cancelAnimationFrame} = globalThis;
export const screen = globalThis.screen as Screen & {
    availLeft?: number,
    availTop?: number,
};
if (!screen.orientation) {
    Object.defineProperty(screen, 'orientation', {
        value: {
            type: 'N/A',
            angle: 0,
        },
    });
}
export const devicePixelRatio = globalThis.devicePixelRatio || 1;
