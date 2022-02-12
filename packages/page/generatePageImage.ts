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
const applyPadding = (
    baseRect: {left: number, top: number, width: number, height: number},
    padding: {left: number, right: number, top: number, bottom: number},
) => {
    const left = baseRect.left + padding.left;
    const right = baseRect.left + baseRect.width - padding.right;
    const top = baseRect.top + padding.top;
    const bottom = baseRect.top + baseRect.height - padding.bottom;
    const width = right - left;
    const height = bottom - top;
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    return {left, right, top, bottom, width, height, cx, cy, padding};
};
const image = {left: 0, top: 0, width: 1200, height: 630};
const card = applyPadding(image, {left: 40, right: 40, top: 40, bottom: 80});
const cardBorderRadius = 30;
const shadowBlurRadius = 16;
const cardContent = applyPadding(card, {left: 40, right: 40, top: 40, bottom: 40});
const logoUnitSize = 12;
const titleFontSize = 72;
const titleLineScale = 1.5;
const baseFontSize = 32;
const baseLineScale = 1.4;
const minFontSize = 14;
/** 29 modules x 7 px/module = 203 */
/** 33 modules x 6 px/module = 198 */
const qrCodeMaxSize = 210;
const qrCodeTop = cardContent.bottom - qrCodeMaxSize;

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
    return {path: destPath, width: image.width, height: image.height};
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
    const canvas = nodeCanvas.createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    await clearCanvas(ctx, page);
    await drawLogo(ctx, page);
    const metadata = await drawMetaData(ctx, page);
    await drawTitle(ctx, page, cardContent.height - metadata.height);
    await drawQrCode(ctx, page);
    return canvas;
};

const clearCanvas = async (ctx: CanvasRenderingContext2D, _page: PageData) => {
    const colors = await getSiteColors();
    ctx.fillStyle = colors.main;
    ctx.beginPath();
    ctx.rect(image.left, image.top, image.width, image.height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    drawRoundedRect(ctx, card.left + 2, card.top + 2, card.width, card.height, cardBorderRadius);
    ctx.fill();
    stackBlur.canvasRGB(ctx.canvas, image.left, image.top, image.width, image.height, shadowBlurRadius);
    ctx.fillStyle = colors.background;
    drawRoundedRect(ctx, card.left - 1, card.top - 1, card.width, card.height, cardBorderRadius);
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
    const logoWidth = logoUnitSize * 8;
    const logoHeight = logoUnitSize * 4;
    ctx.fillStyle = colors.text;
    ctx.translate(cardContent.cx - logoWidth / 2, card.bottom + card.padding.bottom / 2 - logoHeight / 2);
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
    ctx.resetTransform();
};

const getDateText = (page: PageData) => {
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
    return text;
};

const drawTitle = async (
    ctx: CanvasRenderingContext2D,
    page: PageData,
    availableHeight: number,
) => {
    const colors = await getSiteColors();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    let fontSize = titleFontSize;
    let lineHeight = fontSize * titleLineScale;
    let lines: Array<string> = [];
    while (true) {
        ctx.font = `${fontSize}px HiraginoW8`;
        const maxLineCount = Math.floor(availableHeight / lineHeight);
        for await (const line of listTitleLines(ctx, page.title, lineHeight)) {
            if (maxLineCount < lines.push(line)) {
                break;
            }
        }
        if (maxLineCount < lines.length && minFontSize < fontSize) {
            lines = [];
            fontSize -= 2;
            lineHeight = fontSize * titleLineScale;
        } else {
            break;
        }
    }
    for (let index = lines.length; index--;) {
        const line = lines[index];
        const y = cardContent.top + lineHeight * index;
        ctx.fillStyle = colors.text;
        ctx.fillText(line, cardContent.left, y);
    }
};

const listTitleLines = async function* (
    ctx: CanvasRenderingContext2D,
    source: string,
    lineHeight: number,
) {
    let buffer = '';
    let lineCount = 0;
    for await (const phrase of listPhrases(source)) {
        const line = `${buffer}${phrase}`.trim();
        const result = ctx.measureText(line);
        let maxLineWidth = cardContent.width;
        const lineBottom = cardContent.top + lineHeight * (lineCount + 1);
        if (qrCodeTop < lineBottom) {
            maxLineWidth = maxLineWidth - qrCodeMaxSize;
        }
        if (result.width < maxLineWidth) {
            buffer += phrase;
        } else {
            yield buffer.trim();
            lineCount += 1;
            buffer = phrase;
        }
    }
    const lastLine = buffer.trim();
    if (lastLine) {
        yield lastLine;
    }
};

const drawMetaData = async (ctx: CanvasRenderingContext2D, page: PageData) => {
    const colors = await getSiteColors();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = colors.text;
    ctx.translate(cardContent.left, cardContent.bottom);
    const url = `https://${siteDomain}${page.pathname}`;
    let urlFontSize = baseFontSize;
    const availableWidth = cardContent.width - qrCodeMaxSize;
    while (minFontSize < urlFontSize) {
        ctx.font = `${urlFontSize}px HiraginoW6`;
        const urlRect = ctx.measureText(url);
        if (urlRect.width < availableWidth) {
            break;
        } else if (minFontSize < urlFontSize) {
            urlFontSize -= 1;
        }
    }
    ctx.fillText(url, 0, 0);
    ctx.translate(0, -(urlFontSize + baseFontSize * (baseLineScale - 1)));
    ctx.font = `${baseFontSize}px HiraginoW6`;
    ctx.fillText(getDateText(page), 0, 0);
    ctx.resetTransform();
    const height = (urlFontSize + baseFontSize) * baseLineScale;
    return {height};
};

const drawQrCode = async (ctx: CanvasRenderingContext2D, _page: PageData) => {
    const colors = await getSiteColors();
    ctx.strokeStyle = colors.main;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(cardContent.right - qrCodeMaxSize, cardContent.bottom - qrCodeMaxSize, qrCodeMaxSize, qrCodeMaxSize);
    ctx.closePath();
    ctx.stroke();
};
