// @ts-check
import * as fs from 'fs/promises';
import * as path from 'path';
import * as console from 'console';
import * as sass from 'sass';
import * as postcss from 'postcss';
import * as nodeCanvas from 'canvas';
import * as stackBlur from 'stackblur-canvas';
import {getTokenizer, listPhrases} from '@gjbkz/gojabako.zone-kuromoji';
import {getHash, ignoreENOENT, rmrf} from '@gjbkz/gojabako.zone-node-util';
import {ensure, isString} from '@nlib/typing';
import {coverImagesDirectory, pagesDirectory, publicDirectory, rootDirectory} from '../paths.mjs';
import {siteDomain} from '../site.mjs';
import {pageListByPublishedAt} from '../generated.pageList.mjs';
/** @typedef {import('canvas').CanvasRenderingContext2D} CanvasRenderingContext2D */
/** @typedef {import('canvas').Canvas} NodeCanvas */
/** @typedef {import('@gjbkz/gojabako.zone-build-pagelist').PageMetaData} PageMetaData */
/** @typedef {{path: string, width: number, height: number}} PageImageData */
/** @typedef {{left: number, top: number, width: number, height: number}} Rect */
/** @typedef {{left: number, right: number, top: number, bottom: number}} Inset */

/**
 * @template T
 * @param {() => T} fn
 * @returns {() => T}
 */
const cache = (fn) => {
    let cached = null;
    return () => {
        if (!cached) {
            cached = {value: fn()};
        }
        return cached.value;
    };
};

const getSiteColors = cache(async () => {
    const globalScssPath = path.join(pagesDirectory, 'globals.scss');
    const css = await fs.readFile(globalScssPath, 'utf8');
    const compiled = await sass.compileStringAsync(css);
    const root = postcss.parse(compiled.css);
    /** @type {Record<string, string | undefined>} */
    const variables = {};
    root.walkRules((rule) => {
        if (rule.selectors.includes(':root')) {
            rule.walkDecls((decl) => {
                if (decl.variable && decl.prop.startsWith('--')) {
                    variables[decl.prop.slice(2)] = decl.value;
                }
            });
        }
    });
    return ensure(variables, {
        gray0: isString,
        gray1: isString,
        gray2: isString,
        gray3: isString,
        gray4: isString,
        gray5: isString,
        gray6: isString,
        gray7: isString,
        gray8: isString,
        gray9: isString,
    });
});

const setupFont = cache(() => {
    nodeCanvas.registerFont('/Library/Fonts/ヒラギノUD角ゴ StdN W4.otf', {family: 'HiraginoW4'});
    nodeCanvas.registerFont('/Library/Fonts/ヒラギノUD角ゴ StdN W6.otf', {family: 'HiraginoW6'});
    nodeCanvas.registerFont('/Library/Fonts/ヒラギノ角ゴ StdN W8.otf', {family: 'HiraginoW8'});
});

/**
 * @param {Rect} baseRect
 * @param {Inset} padding
 */
const applyPadding = (baseRect, padding) => {
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

const version = '1.0.0';
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
/** @type {Array<Array<[number, number]>>} */
const logoStrokes = [
    [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [2, 2], [2, 4], [0, 4]],
    [[3, 0], [5, 0], [5, 4], [3, 4], [3, 2], [4, 2], [4, 1], [3, 1]],
    [[6, 0], [8, 0], [8, 4], [7, 4], [7, 3], [6, 3]],
];
const tokenizerPromise = getTokenizer(rootDirectory);

/** @param {PageMetaData} page */
const generate = async (page) => {
    const pathDirectory = path.join(coverImagesDirectory, getHash(page.pathname).toString('base64url').slice(0, 8));
    const versionDirectory = path.join(pathDirectory, getHash(JSON.stringify({page, version})).toString('base64url').slice(0, 8));
    const stats = await fs.stat(versionDirectory).catch(ignoreENOENT);
    if (stats && stats.isDirectory()) {
        const names = await fs.readdir(versionDirectory);
        if (names.length === 1) {
            return path.join(versionDirectory, names[0]);
        }
    }
    await rmrf(pathDirectory);
    const canvas = await draw(page);
    const buffer = await getPNGBuffer(canvas);
    const dest = path.join(versionDirectory, `${getHash(buffer).toString('base64url').slice(0, 8)}.png`);
    await fs.mkdir(path.dirname(dest), {recursive: true});
    await fs.writeFile(dest, buffer);
    console.info(`generated: ${path.relative(publicDirectory, dest)} (${page.pathname})`);
    return dest;
};

/** @param {NodeCanvas} canvas */
const getPNGBuffer = async (canvas) => {
    /** @type {Array<Buffer>} */
    const chunks = [];
    for await (const chunk of canvas.createPNGStream({compressionLevel: 9})) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};

/** @param {PageMetaData} page */
const draw = async (page) => {
    setupFont();
    const canvas = nodeCanvas.createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    await clearCanvas(ctx);
    await drawLogo(ctx);
    const metadata = await drawMetaData(ctx, page);
    await drawTitle(ctx, page, cardContent.height - metadata.height);
    await drawQrCode(ctx);
    return canvas;
};

/** @param {CanvasRenderingContext2D} ctx */
const clearCanvas = async (ctx) => {
    const colors = await getSiteColors();
    ctx.fillStyle = colors.gray2;
    ctx.beginPath();
    ctx.rect(image.left, image.top, image.width, image.height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    drawRoundedRect(ctx, card.left + 2, card.top + 2, card.width, card.height, cardBorderRadius);
    ctx.fill();
    stackBlur.canvasRGB(ctx.canvas, image.left, image.top, image.width, image.height, shadowBlurRadius);
    ctx.fillStyle = colors.gray0;
    drawRoundedRect(ctx, card.left - 1, card.top - 1, card.width, card.height, cardBorderRadius);
    ctx.fill();
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
 */
const drawRoundedRect = (ctx, x, y, w, h, r) => {
    const arc = () => ctx.arcTo(0, 0, 0, r, r);
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

/** @param {CanvasRenderingContext2D} ctx */
const drawLogo = async (ctx) => {
    const colors = await getSiteColors();
    const logoWidth = logoUnitSize * 8;
    const logoHeight = logoUnitSize * 4;
    ctx.fillStyle = colors.gray9;
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

/** @param {PageMetaData} page  */
const getDateText = (page) => {
    /** @param {string} dateString */
    const parse = (dateString) => {
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

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {PageMetaData} page
 * @param {number} availableHeight
 */
const drawTitle = async (ctx, page, availableHeight) => {
    const colors = await getSiteColors();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    let fontSize = titleFontSize;
    let lineHeight = fontSize * titleLineScale;
    /** @type {Array<string>} */
    let lines = [];
    while (true) {
        ctx.font = `bold ${fontSize}px HiraginoW8`;
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
        ctx.fillStyle = colors.gray9;
        ctx.fillText(line, cardContent.left, y);
    }
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} source
 * @param {number} lineHeight
 */
const listTitleLines = async function* (ctx, source, lineHeight) {
    let buffer = '';
    let lineCount = 0;
    const tokenizer = await tokenizerPromise;
    for await (const phrase of listPhrases(tokenizer, source)) {
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

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {PageMetaData} page
 */
const drawMetaData = async (ctx, page) => {
    const colors = await getSiteColors();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = colors.gray9;
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

/** @param {CanvasRenderingContext2D} ctx */
const drawQrCode = async (ctx) => {
    const colors = await getSiteColors();
    ctx.strokeStyle = colors.gray6;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(cardContent.right - qrCodeMaxSize, cardContent.bottom - qrCodeMaxSize, qrCodeMaxSize, qrCodeMaxSize);
    ctx.closePath();
    ctx.stroke();
};

/**
 * @param {PageMetaData} page
 * @returns {Promise<PageImageData>}
 */
const generatePageImage = async (page) => {
    const dest = await generate(page);
    return {
        path: ['', ...path.relative(publicDirectory, dest).split(path.sep)].join('/'),
        width: image.width,
        height: image.height,
    };
};

/** @param {Record<string, PageImageData>} pageImages */
const serializePageImages = (pageImages) => `
// @ts-check
/* eslint-disable */
// This file was generated by \`npm run build:pageImages\`
/** @typedef {{path: string, width: number, height: number}} PageImageData */
/** @type {Record<string, PageImageData | undefined>} */
export const pageImages = ${JSON.stringify(pageImages, null, 4)};
`.trimStart();

if (!process.env.CI) {
    /** @type {Record<string, PageImageData>} */
    const pageImages = {};
    for await (const page of pageListByPublishedAt) {
        const result = await generatePageImage(page);
        pageImages[page.pathname] = result;
    }
    const code = serializePageImages(pageImages);
    const dest = path.join(rootDirectory, 'generated.pageImageList.mjs');
    await fs.writeFile(dest, code);
}
