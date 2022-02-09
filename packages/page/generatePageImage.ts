import * as path from 'path';
import * as fs from 'fs';
import type {CanvasRenderingContext2D} from 'canvas';
import nodeCanvas from 'canvas';
import {rootDirectoryPath} from '../fs/constants';
import {getHash} from '../node/getHash';
import {rmrf} from '../fs/rmrf';
import type {SiteColors} from '../site/css';
import {getSiteColors} from '../site/css';

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
    draw(ctx, props, await getSiteColors());
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
};

const draw = (
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
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, height / 2);
    ctx.fillText(url, width / 2, 100);
};
