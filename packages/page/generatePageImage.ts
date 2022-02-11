import type {CanvasRenderingContext2D} from 'canvas';
import nodeCanvas from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import {Buffer} from 'buffer';
import stackBlur from 'stackblur-canvas';
import {nullaryCache} from '../es/cache';
import {Date, Math} from '../es/global';
import {rootDirectoryPath} from '../fs/constants';
import {listPhrases} from '../kuromoji/listPhrases';
import {getHash} from '../node/getHash';
import {siteDomain} from '../site/constants';
import {getSiteColors} from '../site/css';
import type {PageData} from './getPageData';
import {rmrf} from '../fs/rmrf';

const setupFont = nullaryCache(() => {
    nodeCanvas.registerFont('/Library/Fonts/ヒラギノUD明朝 StdN W4.otf', {family: 'HiraginoW4'});
    nodeCanvas.registerFont('/Library/Fonts/ヒラギノUD明朝 StdN W6.otf', {family: 'HiraginoW6'});
    nodeCanvas.registerFont('/Library/Fonts/ヒラギノ明朝 StdN W8.otf', {family: 'HiraginoW8'});
});
const width = 1200;
const height = 630;
const logoUnitSize = 12;
const titleFontSize = 60;
const baseFontSize = 24;
const qrCodeSize = 140;
const marginV = 80;
const marginH = 80;
const border = 40;
const borderRadius = 30;
const blurRadius = 16;

export interface PageImageData {
    path: string,
    width: number,
    height: number,
}

export const generatePageImage = async (page: PageData): Promise<PageImageData> => {
    const canvas = await draw(page);
    const buffer = await getPNGBuffer(canvas);
    const destPath = [
        'images',
        'post',
        `${getHash(page.pathname).toString('base64url').slice(0, 8)}`,
        `${getHash(buffer).toString('base64url').slice(0, 8)}.png`,
    ].join('/');
    const dest = path.join(rootDirectoryPath, 'public', ...destPath.split('/'));
    await rmrf(path.dirname(dest));
    await fs.promises.mkdir(path.dirname(dest), {recursive: true});
    await fs.promises.writeFile(dest, buffer);
    return {path: destPath, width, height};
};

const getPNGBuffer = async (canvas: nodeCanvas.Canvas) => {
    const chunks: Array<Buffer> = [];
    for await (const chunk of canvas.createPNGStream({compressionLevel: 9})) {
        chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks);
};

const draw = async (page: PageData) => {
    setupFont();
    const canvas = nodeCanvas.createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    await clearCanvas(ctx, page);
    await drawLogo(ctx, page);
    await drawDate(ctx, page);
    await drawTitle(ctx, page);
    await drawUrl(ctx, page);
    await drawQrCode(ctx, page);
    return canvas;
};

const clearCanvas = async (ctx: CanvasRenderingContext2D, _page: PageData) => {
    const colors = await getSiteColors();
    ctx.fillStyle = colors.main;
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.closePath();
    ctx.fill();
    const x = marginH - border;
    const y = marginV - border;
    const w = width - (marginH - border) * 2;
    const h = height - (marginV - border) * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    drawRoundedRect(ctx, x + 2, y + 2, w, h, borderRadius);
    ctx.fill();
    stackBlur.canvasRGB(ctx.canvas, 0, 0, width, height, blurRadius);
    ctx.fillStyle = colors.background;
    drawRoundedRect(ctx, x - 1, y - 1, w, h, borderRadius);
    ctx.fill();
};

const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
) => {
    const arc = () => {
        ctx.arcTo(0, 0, 0, r, r);
    };
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.translate(x + w, y);
    arc();
    ctx.translate(0, h);
    ctx.rotate(Math.PI / 2);
    arc();
    ctx.translate(0, w);
    ctx.rotate(Math.PI / 2);
    arc();
    ctx.translate(0, h);
    ctx.rotate(Math.PI / 2);
    arc();
    ctx.closePath();
    ctx.restore();
};

const logoStrokes: Array<Array<[number, number]>> = [
    [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [2, 2], [2, 4], [0, 4]],
    [[3, 0], [5, 0], [5, 4], [3, 4], [3, 2], [4, 2], [4, 1], [3, 1]],
    [[6, 0], [8, 0], [8, 4], [7, 4], [7, 3], [6, 3]],
];

const drawLogo = async (ctx: CanvasRenderingContext2D, _page: PageData) => {
    const colors = await getSiteColors();
    ctx.save();
    ctx.fillStyle = colors.text;
    ctx.translate(width - marginH - logoUnitSize * 8, marginV);
    ctx.scale(logoUnitSize, logoUnitSize);
    for (const [firstPoint, ...points] of logoStrokes) {
        ctx.beginPath();
        ctx.moveTo(firstPoint[0], firstPoint[1]);
        for (const point of points) {
            ctx.lineTo(point[0], point[1]);
        }
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
};

const drawDate = async (ctx: CanvasRenderingContext2D, page: PageData) => {
    const colors = await getSiteColors();
    ctx.font = `${baseFontSize}px HiraginoW6`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const x = marginH;
    const y = marginV;
    ctx.fillStyle = colors.text;
    const parse = (dateString: string) => {
        const date = new Date(dateString);
        return [
            `${date.getFullYear()}年`,
            `${date.getMonth() + 1}月`,
            `${date.getDate()}日`,
        ].join('');
    };
    const publishedAt = parse(page.publishedAt);
    const updatedAt = parse(page.updatedAt);
    let text = `${publishedAt}に公開`;
    if (updatedAt !== publishedAt) {
        text += ` (${updatedAt}に更新)`;
    }
    ctx.fillText(text, x, y);
};

const drawTitle = async (ctx: CanvasRenderingContext2D, page: PageData) => {
    const colors = await getSiteColors();
    const lineHeight = titleFontSize * 1.5;
    ctx.font = `${titleFontSize}px HiraginoW8`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const lines: Array<string> = [];
    for await (const line of listLines(ctx, page.title, width - marginH * 2)) {
        lines.push(line);
    }
    for (let index = lines.length; index--;) {
        const line = lines[index];
        const x = marginH;
        const y = height / 2 + lineHeight * (index - (lines.length - 1) / 2);
        ctx.fillStyle = colors.text;
        ctx.fillText(line, x, y);
    }
};

const listLines = async function* (
    ctx: CanvasRenderingContext2D,
    source: string,
    maxLineWidth: number,
) {
    let buffer = '';
    for await (const phrase of listPhrases(source)) {
        const line = `${buffer}${phrase}`.trim();
        const result = ctx.measureText(line);
        if (result.width < maxLineWidth) {
            buffer += phrase;
        } else {
            yield buffer.trim();
            buffer = phrase;
        }
    }
    const lastLine = buffer.trim();
    if (lastLine) {
        yield lastLine;
    }
};

const drawUrl = async (ctx: CanvasRenderingContext2D, page: PageData) => {
    const colors = await getSiteColors();
    ctx.font = `${baseFontSize}px HiraginoW6`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = colors.text;
    const x = marginH;
    const y = height - marginV;
    const url = `https://${siteDomain}${page.pathname}`;
    ctx.fillText(url, x, y);
};

const drawQrCode = async (ctx: CanvasRenderingContext2D, _page: PageData) => {
    const colors = await getSiteColors();
    ctx.strokeStyle = colors.main;
    ctx.lineWidth = 1;
    const x = width - marginH - qrCodeSize;
    const y = height - marginV - qrCodeSize;
    ctx.beginPath();
    ctx.rect(x, y, qrCodeSize, qrCodeSize);
    ctx.closePath();
    ctx.stroke();
};
