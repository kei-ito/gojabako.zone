import type {CanvasRenderingContext2D} from 'canvas';
import nodeCanvas from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import {rootDirectoryPath} from '../fs/constants';
import {rmrf} from '../fs/rmrf';
import {listPhrases} from '../kuromoji/listPhrases';
import {getHash} from '../node/getHash';
import type {SiteColors} from '../site/css';
import {getSiteColors} from '../site/css';

nodeCanvas.registerFont('/Library/Fonts/ヒラギノUD明朝 StdN W4.otf', {family: 'HiraginoW4'});
nodeCanvas.registerFont('/Library/Fonts/ヒラギノUD明朝 StdN W6.otf', {family: 'HiraginoW6'});
nodeCanvas.registerFont('/Library/Fonts/ヒラギノ明朝 StdN W8.otf', {family: 'HiraginoW8'});

const width = 1200;
const height = 630;
const version = 1;

export const generatePageImage = async (
    props: {
        url: string,
        title: string,
    },
) => {
    const canvas = nodeCanvas.createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    await draw(ctx, props, await getSiteColors());
    const destPath = [
        'post-images',
        `v${version}`,
        `${getHash(props.url).toString('base64url').slice(0, 8)}.png`,
    ].join('/');
    const dest = path.join(rootDirectoryPath, 'public', ...destPath.split('/'));
    await rmrf(dest);
    await fs.promises.mkdir(path.dirname(dest), {recursive: true});
    const writer = fs.createWriteStream(dest);
    for await (const chunk of canvas.createPNGStream({compressionLevel: 9})) {
        writer.write(chunk);
    }
    writer.end();
    return destPath;
};

const draw = async (
    ctx: CanvasRenderingContext2D,
    {url, title}: {
        url: string,
        title: string,
    },
    colors: SiteColors,
) => {
    ctx.fillStyle = colors.background;
    ctx.rect(0, 0, width, height);
    ctx.fill();
    ctx.fillStyle = colors.text;
    {
        const fontSize = 40;
        const lineHeight = fontSize * 1.5;
        ctx.font = `${fontSize}px HiraginoW8`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines: Array<string> = [];
        for await (const line of listLines(ctx, title, height)) {
            lines.push(line);
        }
        lines.forEach((line, index) => {
            const x = width / 2;
            const y = height / 2 + lineHeight * (index - (lines.length - 1) / 2);
            ctx.fillText(line, x, y);
        });
    }
    {
        const fontSize = 20;
        ctx.font = `${fontSize}px HiraginoW6`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const x = width / 2;
        const y = height - fontSize * 1.5;
        ctx.fillText(url, x, y);
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
