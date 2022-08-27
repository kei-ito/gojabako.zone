import type {FC} from 'react';
import {useEffect, useState} from 'react';
import {cancelAnimationFrame, devicePixelRatio, requestAnimationFrame} from '../../../dom/global';
import {Math} from '../../../es/global';
import {useElementSize} from '../../../hooks/useElementSize';
import {className} from './style.module.css';

const msToRad = Math.PI / 500;
const lineWidth = 16;
const offsetRad = Math.PI / -2;

export const FrameRateInspector: FC = () => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const size = useElementSize(canvas);
    useEffect(() => {
        let frameId = requestAnimationFrame((startTimeStamp) => {
            const ctx = 0 < size.width && canvas && canvas.getContext('2d');
            if (!ctx) {
                return;
            }
            const dpr = devicePixelRatio;
            canvas.width = size.width * dpr;
            canvas.height = size.height * dpr;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let previousTimeStamp = startTimeStamp;
            let count = 0;
            let previousSecond = 0;
            const keyframes: Array<[number, number]> = [];
            let elapsedTimeBuffer: Array<number> = [];
            const render = (timeStamp: number) => {
                const second = Math.floor(timeStamp / 1000);
                if (second !== previousSecond) {
                    count = 0;
                }
                if (count % 12 === 0) {
                    keyframes.push([count, timeStamp]);
                }
                while (0 < keyframes.length && 1000 < timeStamp - keyframes[0][1]) {
                    keyframes.shift();
                }
                ctx.save();
                ctx.scale(dpr, dpr);
                const elapsed = timeStamp - previousTimeStamp;
                elapsedTimeBuffer = elapsedTimeBuffer.concat(elapsed).slice(-16);
                const fps = 1000 / (elapsedTimeBuffer.reduce((s, e) => s + e, 0) / elapsedTimeBuffer.length);
                draw(ctx, size, count, timeStamp, previousTimeStamp, fps, keyframes);
                ctx.restore();
                previousSecond = second;
                previousTimeStamp = timeStamp;
                count = (count + 1) % 360;
                frameId = requestAnimationFrame(render);
            };
            render(startTimeStamp);
        });
        return () => cancelAnimationFrame(frameId);
    }, [size, canvas]);
    return <canvas ref={setCanvas} className={className.canvas}/>;
};

const draw = (
    ctx: CanvasRenderingContext2D,
    {width, height}: {width: number, height: number},
    count: number,
    timeStamp: number,
    previousTimeStamp: number,
    fps: number,
    keyframes: Iterable<[number, number]>,
) => {
    const elapsed = timeStamp - previousTimeStamp;
    /** Overwrite the canvas with the transcluent previous image */
    ctx.globalAlpha = 1 - elapsed * 0.001;
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(ctx.canvas, 0, 0, width, height);
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(width / 2, height / 2);
    const radius = (Math.min(width, height) - lineWidth) / 2 - lineWidth;
    ctx.beginPath();
    ctx.arc(0, 0, radius - lineWidth / 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    const color = `hsl(${count * 6}deg,80%,${count % 2 ? 50 : 90}%)`;
    ctx.strokeStyle = color;
    ctx.beginPath();
    const t0 = msToRad * previousTimeStamp + offsetRad;
    const t1 = msToRad * timeStamp + offsetRad;
    ctx.arc(0, 0, radius, t0, t1);
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.fillStyle = 'currentColor';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '40px Arial';
    ctx.fillText(fps.toFixed(1), 0, 0);
    ctx.font = `${lineWidth}px Arial`;
    const textRadius = radius - lineWidth;
    for (const [keyframeCount, keyframeTimeStamp] of keyframes) {
        ctx.save();
        ctx.rotate(msToRad * keyframeTimeStamp);
        ctx.fillText(`${keyframeCount}`, 0, -textRadius);
        ctx.restore();
    }
    ctx.restore();
};
