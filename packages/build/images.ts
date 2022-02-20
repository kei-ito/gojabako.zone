import * as squoosh from '@squoosh/lib';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {getExtension} from '../es/getExtension';
import {console, Error, JSON, Map, Math, Object, Promise, Set} from '../es/global';
import {serializeSize} from '../es/serializeSize';
import {coverImagesDirectory, processedImagesDirectory, publicDirectory, rootDirectoryPath} from '../fs/constants';
import {ignoreENOENT} from '../fs/ignoreENOENT';
import {rmrf} from '../fs/rmrf';
import type {EncodeResult} from '../image/isEncodeResult';
import {isEncodeResult} from '../image/isEncodeResult';
import type {ImageData} from '../image/isImageData';
import {listWidthPatterns} from '../image/listWidthPatterns';
import {getHash} from '../node/getHash';
import {listFiles} from '../node/listFiles';
import {runScript} from '../node/runScript';

const version = 1;
const ignoredInputDirectories = [
    processedImagesDirectory,
    coverImagesDirectory,
];
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.svg', '.heic']);
const resultFileName = 'result.json';

type SquooshImage = ReturnType<typeof squoosh.ImagePool.prototype.ingestImage>;
type SquooshEncodeOptions = Parameters<SquooshImage['encode']>[0];

runScript(async () => {
    for await (const image of listImageFiles()) {
        const imagePool = new squoosh.ImagePool(os.cpus().length);
        const result = image.previous || await processImage(imagePool, image);
        await imagePool.close();
        const componentFilePath = `${image.sourceFileAbsolutePath}.component.tsx`;
        const writer = fs.createWriteStream(componentFilePath);
        for (const line of serializeImageComponentScript(result)) {
            writer.write(`${line}\n`);
        }
        writer.end();
        console.info(`${path.relative(rootDirectoryPath, image.sourceFileAbsolutePath)} → ${image.outputDirectory}`);
    }
});

const isInIgnoredInputDirectories = (filePath: string) => {
    return ignoredInputDirectories.some((directory) => filePath.startsWith(directory));
};

const listImageFiles = async function* () {
    for await (const sourceFileAbsolutePath of listFiles(path.join(rootDirectoryPath, 'src'), path.join(rootDirectoryPath, 'public'))) {
        if (imageExtensions.has(getExtension(sourceFileAbsolutePath)) && !isInIgnoredInputDirectories(sourceFileAbsolutePath)) {
            const relativePath = path.relative(rootDirectoryPath, sourceFileAbsolutePath).split(path.sep).join('/');
            const hash = getHash(relativePath).toString('base64url').slice(0, 8);
            const outputDirectory = path.join(processedImagesDirectory, hash);
            const previous = await loadPreviousResult(outputDirectory);
            yield {previous, sourceFileAbsolutePath, outputDirectory};
        }
    }
};

const processImage = async (
    imagePool: squoosh.ImagePool,
    {sourceFileAbsolutePath, outputDirectory}: {sourceFileAbsolutePath: string, outputDirectory: string},
) => {
    const [loaded] = await Promise.all([
        loadImage(imagePool, sourceFileAbsolutePath),
        clearDirectory(outputDirectory),
    ]);
    let {image} = loaded;
    const result: EncodeResult = {version, source: loaded.source, results: []};
    for (const width of listWidthPatterns(loaded.source.width)) {
        const height = Math.round(loaded.source.height * width / loaded.source.width);
        await image.preprocess({resize: {width}});
        for (const encoded of Object.values(await image.encode(loaded.encodeOptions))) {
            const hash = getHash(encoded.binary).toString('base64url').slice(0, 8);
            const dest = path.join(outputDirectory, `w${width}.${hash}.${encoded.extension}`);
            await fs.promises.writeFile(dest, encoded.binary);
            console.info(`written: ${dest} (${serializeSize(encoded.size)})`);
            result.results.push({
                path: [
                    '',
                    ...path.relative(publicDirectory, dest).split(path.sep),
                ].join('/'),
                hash: getHash(encoded.binary).toString('base64url'),
                width,
                height,
                size: encoded.size,
            });
        }
        image = imagePool.ingestImage(loaded.sourceBuffer);
    }
    const resultPath = path.join(outputDirectory, resultFileName);
    await fs.promises.writeFile(resultPath, JSON.stringify(result, null, 4));
    return result;
};

const loadPreviousResult = async (outputDirectory: string) => {
    const resultPath = path.join(outputDirectory, resultFileName);
    const json = await fs.promises.readFile(resultPath, 'utf8').catch(ignoreENOENT);
    if (!json) {
        console.info(`NoResult: ${resultPath}`);
        return null;
    }
    const parsed: unknown = JSON.parse(json);
    if (isEncodeResult(parsed)) {
        if (parsed.version !== version) {
            console.info(`OldVersion: ${JSON.stringify(parsed.version, null, 4)}`);
            return null;
        }
        for (const result of parsed.results) {
            const filePath = path.join(publicDirectory, ...result.path.split('/'));
            const stats = await fs.promises.stat(filePath).catch(ignoreENOENT);
            if (!stats || !stats.isFile() || stats.size !== result.size) {
                console.info(`FileChanged: ${JSON.stringify(result, null, 4)}`);
                return null;
            }
        }
        return parsed;
    }
    console.info(`UnknownFormat: ${JSON.stringify(parsed, null, 4)}`);
    return null;
};

const clearDirectory = async (directoryPath: string) => {
    await rmrf(directoryPath);
    await fs.promises.mkdir(directoryPath, {recursive: true});
};

const loadImage = async (imagePool: squoosh.ImagePool, sourceFileAbsolutePath: string) => {
    const sourceBuffer = await fs.promises.readFile(sourceFileAbsolutePath);
    const image = imagePool.ingestImage(sourceBuffer);
    const encodeOptions = getEncodeOptions(sourceFileAbsolutePath);
    const {bitmap} = await image.decoded;
    const source: ImageData = {
        path: [
            '',
            ...path.relative(rootDirectoryPath, sourceFileAbsolutePath).split(path.sep),
        ].join('/'),
        hash: getHash(sourceBuffer).toString('base64url'),
        width: bitmap.width,
        height: bitmap.height,
        size: sourceBuffer.byteLength,
    };
    return {source, sourceBuffer, image, encodeOptions};
};

const getEncodeOptions = (sourceFileAbsolutePath: string): SquooshEncodeOptions => {
    const encodeOptions: SquooshEncodeOptions = {
        webp: {
            ...squoosh.encoders.webp.defaultEncoderOptions,
        },
        avif: {
            ...squoosh.encoders.avif.defaultEncoderOptions,
        },
    };
    switch (getExtension(sourceFileAbsolutePath)) {
    case '.png':
        encodeOptions.oxipng = {
            ...squoosh.encoders.oxipng.defaultEncoderOptions,
        };
        break;
    default:
        encodeOptions.mozjpeg = {
            ...squoosh.encoders.mozjpeg.defaultEncoderOptions,
        };
    }
    return encodeOptions;
};

const serializeImageComponentScript = function* (encodeResult: EncodeResult) {
    const resultMap = new Map<string, Array<ImageData>>();
    const getList = (filePath: string) => {
        const type = getType(filePath);
        const list = resultMap.get(type) || [];
        resultMap.set(type, list);
        return list;
    };
    for (const result of encodeResult.results) {
        getList(result.path).push(result);
    }
    yield '/* eslint-disable @next/next/no-img-element */';
    yield 'import type {DetailedHTMLProps, ImgHTMLAttributes} from \'react\';';
    yield 'const Image = (';
    yield '    props: Omit<DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, \'height\' | \'src\' | \'srcset\' | \'width\'>,';
    const {source} = encodeResult;
    const aspectRatioStyle = `style={{aspectRatio: '${source.width}/${source.height}'}}`;
    yield `) => <picture ${aspectRatioStyle}>`;
    for (const [type, results] of resultMap) {
        const srcset = results.map((result) => `${result.path} ${result.width}w`).join(', ');
        if (getType(source.path) === type) {
            yield `    <img alt="" {...props} srcSet="${srcset}" ${aspectRatioStyle} />`;
        } else {
            yield `    <source srcSet="${srcset}" type="${type}" />`;
        }
    }
    yield '</picture>;';
    yield 'export default Image;';
    yield '';
};

const getType = (filePath: string): string => {
    const extension = getExtension(filePath);
    switch (extension) {
    case '.webp':
        return 'image/webp';
    case '.avif':
        return 'image/avif';
    case '.jpg':
    case '.jpeg':
        return 'image/jpeg';
    case '.png':
        return 'image/png';
    case '.svg':
        return 'image/svg+xml';
    default:
        throw new Error(`UnsupportedExtension: ${filePath}`);
    }
};
