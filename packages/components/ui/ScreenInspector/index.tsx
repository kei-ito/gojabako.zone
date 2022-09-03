import {useEffect, useState} from 'react';
import {isBrowser} from '../../../es/isBrowser';
import {useElementRect} from '../../../hooks/useElementRect';
import {useElementSize} from '../../../hooks/useElementSize';
import {useViewPortOffset} from '../../../hooks/useViewPortOffset';
import {className} from './style.module.css';

const screen = globalThis.screen as Screen & {
    availLeft?: number,
    availTop?: number,
};
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (isBrowser && !screen.orientation) {
    Object.defineProperty(screen, 'orientation', {
        value: {type: 'N/A', angle: 0},
    });
}

export const ScreenInspector = () => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const size = useElementSize(canvas);
    const rootRect = useElementRect(getHtmlElement());
    const viewportOffset = useViewPortOffset();
    useEffect(() => {
        let frameId = requestAnimationFrame(() => {
            if (!canvas || !rootRect || !(0 < size.width)) {
                return;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return;
            }
            const dpr = devicePixelRatio;
            canvas.width = size.width * dpr;
            canvas.height = size.height * dpr;
            const render = () => {
                ctx.save();
                ctx.scale(dpr, dpr);
                draw(ctx, size, viewportOffset);
                ctx.restore();
                frameId = requestAnimationFrame(render);
            };
            render();
        });
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [size, canvas, viewportOffset, rootRect]);
    return <canvas ref={setCanvas} className={className.canvas}/>;
};

const getHtmlElement = () => {
    if ('document' in globalThis) {
        return globalThis.document.documentElement;
    }
    return null;
};
const padding = 32 * 2;
const getScreenArea = () => ({
    width: (screen.availLeft || 0) + screen.width,
    height: (screen.availTop || 0) + screen.height,
});
const draw = (
    ctx: CanvasRenderingContext2D,
    {width: canvasWidth, height: canvasHeight}: {width: number, height: number},
    viewportOffset: {left: number, top: number},
) => {
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight - 24);
    ctx.fillText(`DPR: ${devicePixelRatio}  orientation.type: ${screen.orientation.type}`, 0, 0);
    ctx.translate(0, 14);
    ctx.fillText(`orientation.angle: ${screen.orientation.angle}  pixelDepth: ${screen.pixelDepth}  colorDepth: ${screen.colorDepth}`, 0, 0);
    ctx.restore();
    ctx.save();
    const canvasAvailWidth = canvasWidth - padding;
    const canvasAvailHeight = canvasHeight - padding;
    const canvasAspectRatio = canvasAvailWidth / canvasAvailHeight;
    const screenArea = getScreenArea();
    const screenAspectRatio = screenArea.width / screenArea.height;
    const screenWidth = screenAspectRatio < canvasAspectRatio ? canvasAvailHeight * screenAspectRatio : canvasAvailWidth;
    const screenHeight = screenWidth / screenAspectRatio;
    ctx.translate((canvasWidth - screenWidth) / 2, (canvasHeight - screenHeight) / 2 - 4);
    const scale = screenWidth / screenArea.width;
    ctx.lineWidth = 4 / scale;
    ctx.scale(scale, scale);
    ctx.textBaseline = 'top';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#94a3b8';
    drawRect(ctx, scale, 0, 0, screen.width, screen.height);
    ctx.fillStyle = '#ffffff';
    drawRect(ctx, scale, screen.availLeft || 0, screen.availTop || 0, screen.availWidth, screen.availHeight);
    ctx.fillStyle = '#cbd5e1';
    const sx = globalThis.screenLeft || globalThis.screenX;
    const sy = globalThis.screenTop || globalThis.screenY;
    drawRect(ctx, scale, sx, sy, globalThis.outerWidth, globalThis.outerHeight);
    ctx.translate(sx, sy);
    ctx.fillStyle = '#f1f5f9';
    drawRect(ctx, scale, viewportOffset.left, viewportOffset.top, globalThis.innerWidth, globalThis.innerHeight);
    ctx.translate(viewportOffset.left, viewportOffset.top);
    ctx.restore();
};

const drawRect = (ctx: CanvasRenderingContext2D, scale: number, x: number, y: number, w: number, h: number) => {
    ctx.fillRect(x, y, w, h);
    if (0 < x) {
        ctx.fillStyle = 'currentColor';
        ctx.textAlign = 'center';
        ctx.fillRect(0, y + h / 2, x, 1);
        drawText(ctx, scale, `${x}`, x / 2, y + h / 2);
    }
    if (0 < y) {
        ctx.fillStyle = 'currentColor';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(x + w / 2, 0);
        ctx.fillRect(0, 0, 1, y);
        ctx.rotate(Math.PI / 2);
        drawText(ctx, scale, `${y}`, y / 2, 0);
        ctx.restore();
    }
    ctx.textAlign = 'left';
    drawText(ctx, scale, `${w}x${h}`, x, y);
};

const drawText = (ctx: CanvasRenderingContext2D, scale: number, text: string, x: number, y: number) => {
    ctx.font = `${(12 / scale).toFixed(1)}px Arial`;
    ctx.strokeStyle = '#f1f5f9';
    ctx.fillStyle = 'currentColor';
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
};
